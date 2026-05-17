//
//  DocWebView.swift
//  ScriptWidget
//

import SwiftUI
import WebKit

class DocWebViewInternal: WKWebView, WKNavigationDelegate {
    var markdownFile: String = ""
    var anchor: String? = nil
    var isPageLoaded = false

    init() {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        super.init(frame: .zero, configuration: configuration)

        self.isOpaque = false
        self.backgroundColor = UIColor.clear
        self.scrollView.backgroundColor = UIColor.clear
        self.navigationDelegate = self

        loadTemplate()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
    }

    private func loadTemplate() {
        guard let bundleURL = Bundle.main.url(forResource: "Script", withExtension: "bundle") else {
            print("DocWebView: Script.bundle not found")
            return
        }
        let templateURL = bundleURL.appendingPathComponent("docs/render/template.html")
        let baseURL = templateURL.deletingLastPathComponent()
        do {
            let html = try String(contentsOf: templateURL, encoding: .utf8)
            self.loadHTMLString(html, baseURL: baseURL)
        } catch {
            print("DocWebView: failed to load template.html: \(error)")
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        isPageLoaded = true
        renderContent()
    }

    func renderContent() {
        guard isPageLoaded else { return }

        guard let bundleURL = Bundle.main.url(forResource: "Script", withExtension: "bundle") else {
            print("DocWebView: Script.bundle not found")
            return
        }

        let mdURL = bundleURL.appendingPathComponent("docs/\(markdownFile)")
        guard let content = try? String(contentsOf: mdURL, encoding: .utf8) else {
            print("DocWebView: markdown file not found: \(markdownFile)")
            return
        }

        // Escape content for JavaScript string
        let escaped = content
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "`", with: "\\`")
            .replacingOccurrences(of: "$", with: "\\$")

        let anchorJS: String
        if let anchor = anchor {
            let escapedAnchor = anchor
                .replacingOccurrences(of: "\\", with: "\\\\")
                .replacingOccurrences(of: "'", with: "\\'")
            anchorJS = "'\(escapedAnchor)'"
        } else {
            anchorJS = "null"
        }
        let js = "renderMarkdown(`\(escaped)`, \(anchorJS));"

        self.evaluateJavaScript(js) { _, error in
            if let error = error {
                print("DocWebView: JS error: \(error)")
            }
        }
    }
}

struct DocWebView: UIViewRepresentable {
    let markdownFile: String
    let anchor: String?

    func makeUIView(context: Context) -> DocWebViewInternal {
        let webView = DocWebViewInternal()
        webView.markdownFile = markdownFile
        webView.anchor = anchor
        return webView
    }

    func updateUIView(_ uiView: DocWebViewInternal, context: Context) {
        if uiView.markdownFile != markdownFile || uiView.anchor != anchor {
            uiView.markdownFile = markdownFile
            uiView.anchor = anchor
            uiView.isPageLoaded = false
            DispatchQueue.main.async {
                guard let bundleURL = Bundle.main.url(forResource: "Script", withExtension: "bundle") else { return }
                let templateURL = bundleURL.appendingPathComponent("docs/render/template.html")
                let baseURL = templateURL.deletingLastPathComponent()
                if let html = try? String(contentsOf: templateURL, encoding: .utf8) {
                    uiView.loadHTMLString(html, baseURL: baseURL)
                }
            }
        }
    }
}
