//
//  WebView.swift
//  ScriptWidget
//
//  Created by everettjf on 2021/4/21.
//

import SwiftUI
import WebKit
import Combine


struct MirrorEditorInternalActionProvider {
    typealias ISREADONLY = () -> Bool

    var package: ScriptWidgetPackage?
    var filePath: URL?
    var onIsReadOnly: ISREADONLY?
}

class MirrorEditorInternalView: WKWebView {
    
    public var accessoryView: UIView?
    
    var bridge: WKWebViewJavascriptBridge?
    var isEditorReady = false
    var pendingActions: [() -> Void] = []
    var isTearingDown = false
    var filesDidChangeCancellable: AnyCancellable?
    
    var action: MirrorEditorInternalActionProvider?
    /// When false, hides the in-editor remote (PeerJS) editing controls — used for bundle templates.
    var enablePeerEditing: Bool = true
    

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        
    }
    
    init() {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        super.init(frame: .zero, configuration: configuration)
        
        if #available(iOS 16.4, *) {
            self.isInspectable = true
        }

        self.isOpaque = false
        self.backgroundColor = UIColor.clear
        self.scrollView.backgroundColor = UIColor.clear
        
        // accessoryView
        self.accessoryView = self.createAccessoryView()

        // bridge
        self.bridge = WKWebViewJavascriptBridge(webView: self)
        
        // event_editorReady
        self.bridge?.register(handlerName: "event_editorReady") { [weak self] (parameters, callback) in
            self?.isEditorReady = true
            print("event_editorReady : \(String(describing: parameters))")
            self?.eventOnEditorReady()
            callback?(["result":"ok"])
        }
        
        // event_printLog
        self.bridge?.register(handlerName: "event_printLog", handler: { (parameters, callback) in
            guard let value = parameters?["value"] as? String else {
                print("editor print log : param invalid")
                callback?(["result": "failed"])
                return
            }
            
            print("editor print log : \(value)")
            callback?(["result": "ok"])
        })
        
        // method_saveFile: JS -> Swift, save file content (text or binary via encoding param)
        self.bridge?.register(handlerName: "method_saveFile", handler: { [weak self] (parameters, callback) in
            guard let self = self else {
                callback?(["result": "failed", "message": "view deallocated"])
                return
            }
            guard let package = self.action?.package else {
                callback?(["result": "failed", "message": "no package"])
                return
            }
            guard let filePath = parameters?["filePath"] as? String,
                  let content = parameters?["content"] as? String else {
                callback?(["result": "failed", "message": "missing filePath or content"])
                return
            }

            let encoding = (parameters?["encoding"] as? String) ?? "utf8"

            if encoding == "base64" {
                guard let data = Data(base64Encoded: content, options: .ignoreUnknownCharacters) else {
                    callback?(["result": "failed", "message": "invalid base64"])
                    return
                }
                guard let fileURL = package.resolvePackageURL(relativePath: filePath) else {
                    callback?(["result": "failed", "message": "invalid file path"])
                    return
                }
                do {
                    let parent = fileURL.deletingLastPathComponent()
                    if !FileManager.default.fileExists(atPath: parent.path) {
                        try FileManager.default.createDirectory(at: parent, withIntermediateDirectories: true, attributes: [
                            FileAttributeKey.protectionKey: FileProtectionType.none
                        ])
                    }
                    try data.write(to: fileURL)
                    try FileManager.default.setAttributes([FileAttributeKey.protectionKey: FileProtectionType.none], ofItemAtPath: fileURL.path)
                } catch {
                    callback?(["result": "failed", "message": "write error: \(error)"])
                    return
                }
                package.postFilesDidChangeNotification()
                ScriptWidgetTimelineRefresher.requestReload()
            } else {
                let (ok, errorMsg) = package.writeFile(relativePath: filePath, content: content)
                if !ok {
                    callback?(["result": "failed", "message": errorMsg])
                    return
                }
            }

            callback?(["result": "ok"])
        })

        // method_listFiles: JS -> Swift, list all files in the package as a tree
        self.bridge?.register(handlerName: "method_listFiles", handler: { [weak self] (parameters, callback) in
            guard let package = self?.action?.package else {
                callback?(["result": "failed", "message": "no package"])
                return
            }
            let tree = package.listFileTree()
            callback?(["result": "ok", "files": tree])
        })

        // method_getFile: JS -> Swift, read file content
        self.bridge?.register(handlerName: "method_getFile", handler: { [weak self] (parameters, callback) in
            guard let package = self?.action?.package else {
                callback?(["result": "failed", "message": "no package"])
                return
            }
            guard let filePath = parameters?["filePath"] as? String else {
                callback?(["result": "failed", "message": "missing filePath"])
                return
            }
            let encoding = (parameters?["encoding"] as? String) ?? "utf8"

            guard let fileURL = package.resolvePackageURL(relativePath: filePath) else {
                callback?(["result": "failed", "message": "invalid file path"])
                return
            }

            var isDir: ObjCBool = false
            if !FileManager.default.fileExists(atPath: fileURL.path, isDirectory: &isDir) || isDir.boolValue {
                callback?(["result": "failed", "message": "file not found"])
                return
            }

            if encoding == "base64" {
                if let data = try? Data(contentsOf: fileURL) {
                    callback?(["result": "ok", "content": data.base64EncodedString(), "encoding": "base64"])
                } else {
                    callback?(["result": "failed", "message": "read error"])
                }
            } else {
                let (content, errorInfo) = package.readFile(relativePath: filePath)
                if let content = content {
                    callback?(["result": "ok", "content": content, "encoding": "utf8"])
                } else {
                    callback?(["result": "failed", "message": errorInfo])
                }
            }
        })

        // method_removeFile: JS -> Swift, delete a file from the package
        self.bridge?.register(handlerName: "method_removeFile", handler: { [weak self] (parameters, callback) in
            guard let package = self?.action?.package else {
                callback?(["result": "failed", "message": "no package"])
                return
            }
            guard let filePath = parameters?["filePath"] as? String, !filePath.isEmpty else {
                callback?(["result": "failed", "message": "missing filePath"])
                return
            }
            guard let fileURL = package.resolvePackageURL(relativePath: filePath) else {
                callback?(["result": "failed", "message": "invalid file path"])
                return
            }
            do {
                try FileManager.default.removeItem(at: fileURL)
            } catch {
                callback?(["result": "failed", "message": "delete error: \(error)"])
                return
            }
            package.postFilesDidChangeNotification()
            ScriptWidgetTimelineRefresher.requestReload()
            callback?(["result": "ok"])
        })

        // Load CodeMirror bundle
        guard let bundlePath = Bundle.main.url(forResource: "MirrorEditor", withExtension: "bundle") else {
            fatalError("MirrorEditor.bundle is missing")
        }
        guard let bundle = Bundle(url: bundlePath) else {
            fatalError("MirrorEditor.bundle is missing")
        }
        guard let indexPath = bundle.path(forResource: "build/index", ofType: "html") else {
            fatalError("MirrorEditor.bundle is missing")
        }
        let baseUrl = bundle.resourceURL!.appendingPathComponent("build")
        
        print("base url = \(baseUrl)")
        var html = try! String(contentsOfFile: indexPath)
        if AppHelper.isdarkmode() {
            html = html.replacingOccurrences(of: "theme:light", with: "theme:dark")
        }
        self.loadHTMLString(html, baseURL: baseUrl)
    }
    
    func subscribeToFileChanges() {
        filesDidChangeCancellable?.cancel()
        guard let package = action?.package else { return }
        let packagePath = package.path.standardizedFileURL.path
        filesDidChangeCancellable = NotificationCenter.default.publisher(for: ScriptWidgetPackage.filesDidChangeNotification)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] notification in
                guard let self = self, !self.isTearingDown else { return }
                guard let changedPath = notification.userInfo?[ScriptWidgetPackage.filesDidChangePackagePathKey] as? String,
                      changedPath == packagePath else { return }
                self.pushFileListToJS()
            }
    }

    func pushFileListToJS() {
        guard !isTearingDown, let package = action?.package else { return }
        package.updateFiles()
        let tree = package.listFileTree()
        self.bridge?.call(handlerName: "editor_updateFiles", data: ["files": tree], callback: nil)
    }

    deinit {
        print("de-init editor")
        isTearingDown = true
        pendingActions.removeAll()
        filesDidChangeCancellable?.cancel()
        self.stopLoading()
        self.bridge = nil
    }
    
    public override var inputAccessoryView: UIView? {
        return accessoryView
    }
    
    func editor_insertValue(value: String) {
        guard !isTearingDown else { return }
        let message = [
            "value": value
        ]
        self.bridge?.call(handlerName: "editor_insertValue", data: message, callback: { responseData in
            print("editor_insertValue response : \(String(describing: responseData))")
        })
    }

    func editor_formatCode() {
        guard !isTearingDown else { return }
        let message = [
            "value": "format"
        ]
        self.bridge?.call(handlerName: "editor_formatCode", data: message, callback: { responseData in
            print("editor_formatCode response : \(String(describing: responseData))")
        })
    }

    func editor_setReadonly(readonly: Bool) {
        guard !isTearingDown else { return }
        let message: [String: Any] = [
            "readonly": readonly
        ]
        self.bridge?.call(handlerName: "editor_setReadonly", data: message, callback: { responseData in
            print("editor_setReadonly response : \(String(describing: responseData))")
        })
    }
    
    func editor_setPeerEnabled(enabled: Bool) {
        guard !isTearingDown else { return }
        let message: [String: Any] = ["enabled": enabled]
        self.bridge?.call(handlerName: "editor_setPeerEnabled", data: message, callback: { responseData in
            print("editor_setPeerEnabled response : \(String(describing: responseData))")
        })
    }
    
    func applyPeerEditingConfig() {
        editor_setPeerEnabled(enabled: enablePeerEditing)
    }
    
    func updateScript() {
        self.runJSAction { [weak self] in
            guard let self = self else { return }
            print("update script")
            self.applyEditorConfig()
        }
    }
    
    func runJSAction(_ action:@escaping () -> Void) {
        guard !isTearingDown else { return }
        if self.isEditorReady {
            DispatchQueue.main.async {
                action()
            }
        } else {
            DispatchQueue.main.async {
                self.pendingActions.append(action)
            }
        }
    }
    
    func eventOnEditorReady() {
        DispatchQueue.main.async {
            let pendingActions = self.pendingActions
            self.pendingActions = []
            for action in pendingActions {
                action()
            }
            
            DispatchQueue.main.async {
                self.applyPeerEditingConfig()
            }
        }
    }
    
    func editor_loadFile(fileName: String) {
        guard !isTearingDown else { return }
        let message: [String: Any] = ["fileName": fileName]
        self.bridge?.call(handlerName: "editor_loadFile", data: message, callback: { responseData in
            print("editor_loadFile response : \(String(describing: responseData))")
        })
    }

    func applyEditorConfig() {
        subscribeToFileChanges()
        if let filePath = action?.filePath, let package = action?.package {
            let relativePath = filePath.standardizedFileURL.path
                .replacingOccurrences(of: package.path.standardizedFileURL.path + "/", with: "")
            self.editor_loadFile(fileName: relativePath)
        }
        if let onIsReadOnly = action?.onIsReadOnly {
            self.editor_setReadonly(readonly: onIsReadOnly())
        } else {
            self.editor_setReadonly(readonly: false)
        }
        self.applyPeerEditingConfig()
    }
    
}


extension MirrorEditorInternalView {
    
    func createAccessoryView() -> UIView {
        let accessoryHeight:CGFloat = 44
        let doneButtonWidth: CGFloat = 50
        let screen = UIScreen.main.bounds.size
        let containerView = UIView(frame: CGRect(x: 0, y: 0, width: screen.width, height: accessoryHeight))
        containerView.backgroundColor = UIColor.systemBackground
        
        
        // format button view
        let formatButton = UIButton(frame: CGRect(x: screen.width - doneButtonWidth * 2, y: 0, width: doneButtonWidth, height: accessoryHeight))
        formatButton.setImage(UIImage(systemName: "paintbrush"), for: .normal)
        formatButton.addTarget(self, action: #selector(onButtonFormatTapped(sender:)), for: .touchUpInside)
        containerView.addSubview(formatButton)
        
        // done button view
        let doneButton = UIButton(frame: CGRect(x: screen.width - doneButtonWidth, y: 0, width: doneButtonWidth, height: accessoryHeight))
        doneButton.setImage(UIImage(systemName: "keyboard"), for: .normal)
        doneButton.addTarget(self, action: #selector(onButtonDoneTapped(sender:)), for: .touchUpInside)
        containerView.addSubview(doneButton)
        
        // scroll view
        let scrollView = UIScrollView(frame: CGRect(x: 0, y: 0, width: screen.width - doneButtonWidth*2, height: accessoryHeight))
        scrollView.showsHorizontalScrollIndicator = false
        containerView.addSubview(scrollView)
        
        let buttonItemWidth = 40
        let buttonItemTitles = [
            "<",
            ">",
            "/",
            ".",
            "$",
            "\"",
            "'",
            "(",
            ")",
            "_",
            ";",
            "+",
            "-",
            "[",
            "]",
            "?",
            "`",
        ]
        for (index, title) in buttonItemTitles.enumerated() {
            self.addToolbarItemToView(parent: scrollView, title: title, index: index, width: buttonItemWidth)
        }
        scrollView.contentSize = CGSize(width: CGFloat(buttonItemTitles.count * buttonItemWidth), height: accessoryHeight)
        
        return containerView
    }
    
    func addToolbarItemToView(parent: UIView, title: String, index: Int, width: Int) {
        let button = UIButton(frame: CGRect(x: index * width, y: 0, width: width, height: 44))
        button.setTitle(title, for: .normal)
        button.setTitleColor(UIColor.label, for: .normal)
        button.addTarget(self, action: #selector(onToolbarItemTapped(sender:)), for: .touchUpInside)
        parent.addSubview(button)
    }
    
    func createBarButton(_ title: String) -> UIBarButtonItem {
        return UIBarButtonItem(title: title, style: .plain, target: self, action: #selector(onToolbarItemTapped(sender:)))
    }
    
    @objc func onToolbarItemTapped(sender: UIButton) {
        guard let text = sender.title(for: .normal) else {
            return
        }
        DispatchQueue.main.async {
            self.editor_insertValue(value: text)
        }
    }
    
    @objc func onButtonDoneTapped(sender: UIButton) {
        self.resignFirstResponder()
    }
    @objc func onButtonFormatTapped(sender: UIButton) {
        self.editor_formatCode()
    }
}
