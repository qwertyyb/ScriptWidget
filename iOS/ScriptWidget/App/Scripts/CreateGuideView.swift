//
//  CreateGuideView.swift
//  ScriptWidget
//
//  Created by everettjf on 2021/1/3.
//

import SwiftUI


class CreateGuideDataObject: ObservableObject {
    @Published var models = [ScriptModel]()

    init() {
        
        
        DispatchQueue.global().async { [self] in
            var items = ScriptManager.listBundleScripts(bundle: "Script", relativePath: "template")
            if let index = items.firstIndex(where: { (model) -> Bool in
                return model.name == "Empty Script"
            }) {
                items.move(fromOffsets: [index], toOffset: 0)
            }
            
            DispatchQueue.main.async {
                self.models = items
            }
        }
        
    }
}


struct CreateGuideView: View {
    @ObservedObject var dataObject = CreateGuideDataObject()
    
    @Environment(\.presentationMode) var presentationMode

    @State private var showNameAlert = false
    @State private var scriptName = ""
    @State private var pendingTemplate: ScriptModel?

    var body: some View {
        NavigationStack {
            List {
                ForEach(dataObject.models) { item in
                    NavigationLink(destination: ScriptCodeEditorView(mode: .creator, scriptModel: item, actionCreate: {
                        pendingTemplate = item
                        scriptName = item.name
                        showNameAlert = true
                    })) {
                        WidgetRowView(model: item)
                    }
                }
            }
            .navigationTitle("Create from template")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: {
                        presentationMode.wrappedValue.dismiss()
                    }) {
                        Label("Close", systemImage: "xmark")
                            .labelStyle(.iconOnly)
                    }
                }
            }
        }
        .alert("Script Name", isPresented: $showNameAlert) {
            TextField("Enter script name", text: $scriptName)
            Button("Cancel", role: .cancel) {
                pendingTemplate = nil
            }
            Button("Create") {
                guard let item = pendingTemplate else { return }
                guard !scriptName.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                guard let content = item.package.readMainFile().0 else { return }

                let imageCopyPath = item.package.imagePath
                _ = sharedScriptManager.createScript(content: content, recommendPackageName: scriptName, imageCopyPath: imageCopyPath)

                NotificationCenter.default.post(name: ScriptWidgetHomeViewDataObject.scriptCreateNotification, object: nil)

                pendingTemplate = nil
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    self.presentationMode.wrappedValue.dismiss()
                }
            }
        } message: {
            Text("Enter a name for your new script")
        }
    }
}

struct CreateGuideView_Previews: PreviewProvider {
    static var previews: some View {
        CreateGuideView()
    }
}
