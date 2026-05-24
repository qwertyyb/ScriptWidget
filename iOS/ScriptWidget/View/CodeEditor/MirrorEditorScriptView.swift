//
//  MirrorEditorView.swift
//  ScriptWidget
//
//  Created by everettjf on 2022/3/12.
//

import SwiftUI


struct MirrorEditorScriptView: UIViewRepresentable {
    @Environment(\.presentationMode) var presentationMode
    
    let model: ScriptModel
    let filePath: URL
    
    init(model: ScriptModel, filePath: URL) {
        self.model = model
        self.filePath = filePath
        withUnsafePointer(to: &self) { addr in
            print("MirrorEditorScriptView \(addr) init : \(filePath.lastPathComponent)")
        }
    }
    
    func createActionProvider() -> MirrorEditorInternalActionProvider {
        return MirrorEditorInternalActionProvider(
            package: model.package,
            filePath: filePath,
            onIsReadOnly: {
                return model.package.readonly
            }
        )
    }
    
    func makeUIView(context: Context) -> MirrorEditorInternalView {
        print("MirrorEditorScriptView make ui view : \(filePath.lastPathComponent)")
        let uiView = MirrorEditorInternalView()
        uiView.action = createActionProvider()
        uiView.enablePeerEditing = !model.package.readonly
        
        return uiView;
    }
    
    func updateUIView(_ uiView: MirrorEditorInternalView, context: Context) {
        print("MirrorEditorScriptView update ui view: \(filePath.lastPathComponent)")
        uiView.action = createActionProvider()
        uiView.enablePeerEditing = !model.package.readonly
        uiView.updateScript()
        if uiView.isEditorReady {
            uiView.applyPeerEditingConfig()
        }
    }
    
}
