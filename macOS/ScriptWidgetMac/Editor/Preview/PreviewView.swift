//
//  PreviewView.swift
//  ScriptWidgetMac
//
//  Created by everettjf on 2022/1/15.
//

import SwiftUI
import Combine



struct ScriptCodePreviewConsoleOutput: Identifiable {
    let id = UUID()
    let level: ScriptWidgetConsoleLevel
    let message: String
}

class ScriptCodePreviewConsoleDataObject: ObservableObject {
    @Published var consoleOutputs: [ScriptCodePreviewConsoleOutput] = []
    var cancellables = [Cancellable]()

    init() {
        let cancellableAddLog = NotificationCenter.default.publisher(for: .scriptWidgetConsoleLogAdded)
            .sink { [weak self] notification in
                guard let self else { return }
                guard let entry = notification.object as? ScriptWidgetConsoleEntry else {
                    return
                }
                self.consoleOutputs.append(
                    ScriptCodePreviewConsoleOutput(level: entry.level, message: entry.message)
                )
            }
        cancellables.append(cancellableAddLog)

        let cancellableClearLog = NotificationCenter.default.publisher(for: .scriptWidgetConsoleLogClear)
            .sink { [weak self] _ in
                self?.consoleOutputs.removeAll()
            }
        cancellables.append(cancellableClearLog)
    }

    deinit {
        for cancellable in cancellables {
            cancellable.cancel()
        }
    }

    static func addLog(_ entry: ScriptWidgetConsoleEntry) {
        NotificationCenter.default.post(name: .scriptWidgetConsoleLogAdded, object: entry)
    }

    static func clearLog() {
        NotificationCenter.default.post(name: .scriptWidgetConsoleLogClear, object: nil)
    }
}

private func consoleForegroundColor(for level: ScriptWidgetConsoleLevel) -> Color {
    switch level {
    case .log:
        return .primary
    case .info:
        return .blue
    case .warn:
        return .orange
    case .error:
        return .red
    case .system:
        return .secondary
    }
}

struct ScriptCodePreviewConsoleView: View {
    @ObservedObject var data = ScriptCodePreviewConsoleDataObject()

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 6) {
                ForEach(data.consoleOutputs) { item in
                    Text(verbatim: item.message)
                        .foregroundColor(consoleForegroundColor(for: item.level))
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .multilineTextAlignment(.leading)
                        .font(.footnote)
                        .textSelection(.enabled)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
        }
    }
}



class ScriptCodeRunnerDataObject : ObservableObject {
    let package: ScriptWidgetPackage
    var widgetSizeType: Int
    var scriptParameter: String
    
    var cancellables = [Cancellable]()
    
    @Published var rootElement : ScriptWidgetRuntimeElement
    var runtime: ScriptWidgetRuntime?

    private let previewQueue = DispatchQueue(label: "mac-preview-queue", qos: .userInitiated)

    init(file: ScriptWidgetPackage, widgetSizeType: Int, scriptParameter: String) {
        self.widgetSizeType = widgetSizeType
        self.scriptParameter = scriptParameter
        self.package = file
        self.rootElement = ScriptWidgetRuntimeElement(tagString: "text", props: nil, children: ["#Loading#"])
        self.layoutElements()
        
        let cancellableSave = NotificationCenter.default.publisher(for: PreviewService.updateNotification)
            .sink { [weak self](notification) in
                // re-execute
                DispatchQueue.main.async {
                    self?.rootElement = ScriptWidgetRuntimeElement(tagString: "text", props: nil, children: ["#Loading#"])
                    self?.layoutElements()
                }
            }
        self.cancellables.append(cancellableSave)
    }
    
    deinit {
        for cancellable in self.cancellables {
            cancellable.cancel()
        }
    }
    
    func changeWidgetSizeType(_ newWidgetSizeType : Int) {
        self.widgetSizeType = newWidgetSizeType
        
        self.layoutElements()
    }
    
    func changeWidgetParameter(_ parameter: String) {
        self.scriptParameter = parameter
        
        self.layoutElements()
    }
    
    func layoutElements() {
        previewQueue.async { [weak self] in
            guard let self else { return }
            let ok = self.runScript()
            DispatchQueue.main.async {
                if !ok {
                    self.rootElement = ScriptWidgetRuntimeElement(tagString: "text", props: nil, children: ["#Failed#"])
                }
                self.systemLog("FINISH")
            }
        }
    }

    func runScript() -> Bool {
        sharedRunningState = ScriptWidgetRunningState(package: self.package)

        DispatchQueue.main.async {
            ScriptCodePreviewConsoleDataObject.clearLog()
            self.systemLog("START")
        }

        let JSXResult = self.package.readMainFile()
        guard let JSX = JSXResult.0 else {
            self.systemLog("Can not open file : \(JSXResult.1)")
            return false
        }

        var returnValue = false

        var widgetSizeString = ""
        switch widgetSizeType {
        case 0: widgetSizeString = "small"
        case 1: widgetSizeString = "medium"
        case 2: widgetSizeString = "large"
        default: widgetSizeString = "small"
        }

        let runtime = ScriptWidgetRuntime(package: self.package, environments: [
            "widget-size": widgetSizeString,
            "widget-param": self.scriptParameter,
        ])

        let result = runtime.executeJSXSyncForWidget(JSX)

        if let element = result.0 {
            DispatchQueue.main.async {
                self.rootElement = element
                self.runtime = runtime
            }
            returnValue = true
        } else {
            DispatchQueue.main.async {
                self.runtime = nil
            }
            returnValue = false
            if let error = result.1 {
                switch error {
                case .undefinedRender(let msg):
                    self.systemLog(msg)
                case .internalError(let msg):
                    self.systemLog(msg)
                case .scriptError(let msg):
                    self.systemLog(msg)
                case .scriptException(let msg):
                    self.systemLog(msg)
                case .transformError(let msg):
                    self.systemLog(msg)
                }
            }
        }

        return returnValue
    }

    func systemLog(_ str: String) {
        DispatchQueue.main.async {
            ScriptCodePreviewConsoleDataObject.addLog(
                ScriptWidgetConsoleEntry(level: .system, message: "$" + str)
            )
        }
    }
}


class PreviewService {
    public static let updateNotification = Notification.Name("PreviewService_UpdateNotification")
}

struct PreviewView: View {
    
    let scriptModel: ScriptModel
    @ObservedObject var data: ScriptCodeRunnerDataObject
    
    @State var widgetSizeType = 0
    @State var isDebugMode = false
    
    @State var scriptParameter = ""
    @State var scriptParameterApplied = ""
    
    init(scriptModel: ScriptModel) {
        self.scriptModel = scriptModel
        self.data = ScriptCodeRunnerDataObject(file: self.scriptModel.package, widgetSizeType: 0, scriptParameter: "")
    }
    
    var body: some View {
        content
    }
    
    var preview: some View {
        ScriptWidgetElementView(
            element: data.rootElement,
            context:
                ScriptWidgetElementContext(
                    runtime: data.runtime ,
                    debugMode: isDebugMode,
                    scriptName: scriptModel.name,
                    scriptParameter: scriptParameterApplied,
                    package: self.scriptModel.package
                )
        )
            .frame(
                width: PreviewWidgetSize.size(self.widgetSizeType).width,
                height: PreviewWidgetSize.size(self.widgetSizeType).height
            )
            .cornerRadius(10)
    }
    
    var content: some View {
        
        VStack(alignment: .leading) {
            
            ZStack {
                Rectangle()
                    .fill(Color.secondary)
                    .opacity(0.2)
                
                preview
            }
            .frame(height: PreviewWidgetSize.size(self.widgetSizeType).height + 5)
            
            
            Section {
                HStack {
                    Picker(selection: $widgetSizeType) {
                        Text("Small").tag(0)
                        Text("Medium").tag(1)
                        Text("Large").tag(2)
                    } label: {
                        Text("Preview Size")
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    .onChange(of: widgetSizeType, perform: { value in
                        print("preview size changed : \(value)")
                        
                        self.data.changeWidgetSizeType(value)
                    })
                }
                .padding(.top, 5)
                
                HStack {
                    Toggle(isOn: $isDebugMode) {
                        Text("Debug Border")
                    }.toggleStyle(SwitchToggleStyle())

                    Spacer()

                    Button {
                        guard let image = preview.snapshot() else {
                            print("Failed snapshot")
                            MacKitUtil.alertWarn(title: "Tip", message: "Failed snapshot")
                            return
                        }
                        print("Succeed snapshot")
                        
                        MacKitUtil.selectDirectory(title: "Save snapshot to ?") { path in
                            guard let path = path else {
                                // cancelled
                                return
                            }
                            var targetPath = path.appendingPathComponent("snapshot.png")
                            var index = 0
                            while true {
                                if !FileManager.default.fileExists(atPath: targetPath.path) {
                                    break
                                }
                                
                                // file existed
                                index += 1
                                targetPath = path.appendingPathComponent("snapshot\(index).png")
                            }
                            print("target path : \(targetPath)")
                            
                            MacKitUtil.saveImage(image, atUrl: targetPath)
                            
                            MacKitUtil.alertInfo(title: "Tip", message: "Succeed save snapshot to : \(targetPath.path)")
                        }
                        
                    } label: {
                        Text("Snapshot")
                        Image(systemName: "photo")
                    }

                }
                
                
                HStack {
                    TextField("Parameter", text: $scriptParameter)
                    Button("Apply") {
                        self.scriptParameterApplied = self.scriptParameter
                        self.data.changeWidgetParameter(self.scriptParameterApplied)
                    }
                }
            }
            .padding(.leading)
            .padding(.trailing)
            
            ScriptCodePreviewConsoleView()
        }
    }
}

struct PreviewView_Previews: PreviewProvider {
    static var previews: some View {
        PreviewView(scriptModel: globalScriptModel)
            .frame(width: 300, height: 600, alignment: .topLeading)
    }
}
