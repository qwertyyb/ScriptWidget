//
//  DocDetailView.swift
//  ScriptWidgetMac
//

import SwiftUI
import WebKit

class MacDocWebViewInternal: WKWebView, WKNavigationDelegate {
    var markdownFile: String = ""
    var anchor: String? = nil
    var isPageLoaded = false

    init() {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        super.init(frame: .zero, configuration: configuration)

        self.setValue(false, forKey: "drawsBackground")
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
                print("DocWebView JS error: \(error)")
            }
        }
    }
}

struct MacDocWebView: NSViewRepresentable {
    let markdownFile: String
    let anchor: String?

    func makeNSView(context: Context) -> MacDocWebViewInternal {
        let webView = MacDocWebViewInternal()
        webView.markdownFile = markdownFile
        webView.anchor = anchor
        return webView
    }

    func updateNSView(_ nsView: MacDocWebViewInternal, context: Context) {
        if nsView.markdownFile != markdownFile || nsView.anchor != anchor {
            nsView.markdownFile = markdownFile
            nsView.anchor = anchor
            nsView.isPageLoaded = false
            guard let bundleURL = Bundle.main.url(forResource: "Script", withExtension: "bundle") else { return }
            let templateURL = bundleURL.appendingPathComponent("docs/render/template.html")
            let baseURL = templateURL.deletingLastPathComponent()
            if let html = try? String(contentsOf: templateURL, encoding: .utf8) {
                nsView.loadHTMLString(html, baseURL: baseURL)
            }
        }
    }
}

struct DocDetailView: View {
    let title: String
    let markdownFile: String
    let anchor: String?

    init(title: String, markdownFile: String, anchor: String? = nil) {
        self.title = title
        self.markdownFile = markdownFile
        self.anchor = anchor
    }

    var body: some View {
        MacDocWebView(markdownFile: markdownFile, anchor: anchor)
            .navigationTitle(title)
    }
}

struct DocDetailView_Previews: PreviewProvider {
    static var previews: some View {
        DocDetailView(title: "Quick Start", markdownFile: "getting-started.md")
    }
}
