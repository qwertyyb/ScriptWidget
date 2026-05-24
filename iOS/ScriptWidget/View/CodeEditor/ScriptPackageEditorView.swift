//
//  ScriptPackageEditorView.swift
//  ScriptWidget
//
//  Created by everettjf on 2022/9/10.
//

import SwiftUI

struct ScriptPackageEditorView: View {
    let model: ScriptModel
    let filePath: URL

    var body: some View {
        MirrorEditorScriptView(model: model, filePath: filePath)
    }
}

struct ScriptPackageEditorView_Previews: PreviewProvider {
    static var previews: some View {
        ScriptPackageEditorView(model: globalScriptModel, filePath: globalScriptModel.package.jsxPath)
    }
}
