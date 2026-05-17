//
//  ScriptPackageHorizontalFileView.swift
//  ScriptWidget
//
//  Created by everettjf on 2022/9/10.
//

import SwiftUI
import Combine

struct ScriptPackageFileItemView: View {
    let name: String
    let highlight: Bool
    let onTapped: () -> Void

    var body: some View {
        Button {
            onTapped()
        } label: {
            HStack(spacing: 2) {
                Image(systemName: "doc")
                Text(name)
            }
            .font(highlight ? .caption : .caption2)
            .fontWeight(highlight ? .bold : .regular)
        }
        .buttonStyle(.bordered)
        .padding(.all, 0)
    }
}

class ScriptPackageHorizontalFileListStateObject: ObservableObject {
    let model: ScriptModel
    @Published var files: [FileModel]

    private var cancellables = Set<AnyCancellable>()
    private let packageRootPath: String

    init(model: ScriptModel) {
        self.model = model
        self.packageRootPath = model.package.path.standardizedFileURL.path
        self.files = model.package.listRootFiles()

        NotificationCenter.default.publisher(for: ScriptWidgetPackage.filesDidChangeNotification)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] notification in
                guard let self else { return }
                guard let changedPath = notification.userInfo?[ScriptWidgetPackage.filesDidChangePackagePathKey] as? String else {
                    return
                }
                if changedPath != self.packageRootPath {
                    return
                }
                self.reload()
            }
            .store(in: &cancellables)
    }

    func reload() {
        model.package.updateFiles()
        files = model.package.listRootFiles()
    }
}

struct ScriptPackageHorizontalFileView: View {
    @Binding var currentFilePath: URL
    @StateObject private var state: ScriptPackageHorizontalFileListStateObject
    let onFileChanged: (_ file: FileModel) -> Void

    init(model: ScriptModel, currentFilePath: Binding<URL>, onFileChanged: @escaping (_: FileModel) -> Void) {
        _currentFilePath = currentFilePath
        _state = StateObject(wrappedValue: ScriptPackageHorizontalFileListStateObject(model: model))
        self.onFileChanged = onFileChanged
    }

    private func isHighlighted(_ file: FileModel) -> Bool {
        currentFilePath.standardizedFileURL.lastPathComponent == file.name
    }

    var body: some View {
        ScrollView(.horizontal) {
            HStack(spacing: 2) {
                ForEach(state.files) { file in
                    ScriptPackageFileItemView(name: file.name, highlight: isHighlighted(file)) {
                        currentFilePath = file.path
                        onFileChanged(file)
                    }
                }
                Spacer()
            }
        }
        .onAppear {
            state.reload()
        }
    }
}

struct ScriptPackageHorizontalFileView_Previews: PreviewProvider {
    static var previews: some View {
        ScriptPackageHorizontalFileView(
            model: globalScriptModel,
            currentFilePath: .constant(globalScriptModel.package.jsxPath)
        ) { _ in
        }
    }
}
