//
//  ResourceCodeView.swift
//  ScriptWidget
//
//  Created by everettjf on 2022/1/29.
//

import SwiftUI

struct ResourceCodeView: View {
    
    @Environment(\.presentationMode) var presentationMode
    
    @State var showingToast = false
    @State var toastMessage = ""
    @State var showShareActivity = false

    let model: ScriptModel
    
    
    init(model: ScriptModel) {
        self.model = model
        
        self.model.package.updateImages()
    }
    
    var body: some View {
        content
    }
    
    var content: some View {
        NavigationView {
            List{
                Section(header: Text("Images")) {
                    NavigationLink(destination: ImageListView(model: model)) {
                        Label("Images", systemImage: "photo")
                    }
                }
                Section(header: Text("Files")) {
                    NavigationLink(destination: FileListView(model: model)) {
                        Label("Files", systemImage: "doc.plaintext")
                    }
                }
                Section(header: Text("Share")) {
                    Button {
                        showShareActivity = true
                    } label: {
                        Label("Export Script (.jwt)", systemImage: "square.and.arrow.up")
                    }
                }
                
            }
            .navigationBarTitle(Text("Resources"), displayMode: .inline)
            .navigationBarItems(
                trailing: Button (action: {
                    presentationMode.wrappedValue.dismiss()
                }, label: {
                    Image(systemName: "xmark")
                        .padding()
                })
            )
            .sheet(isPresented: $showShareActivity) {
                ActivityViewController(activityItems: sharedScriptManager.exportScriptItemsInTempPath(model: model))
            }
        }
    }
}

struct ResourceCodeView_Previews: PreviewProvider {
    static var previews: some View {
        ResourceCodeView(model: globalScriptModel)
            .preferredColorScheme(.dark)
            .previewDevice("iPhone 12 Pro")
        
    }
}
