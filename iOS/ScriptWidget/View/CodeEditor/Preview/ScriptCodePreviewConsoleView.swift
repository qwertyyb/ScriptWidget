//
//  ScriptCodePreviewConsoleView.swift
//  ScriptWidget
//
//  Created by everettjf on 2022/9/10.
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
                guard let entry = notification.object as? ScriptWidgetConsoleEntry else {
                    return
                }
                self?.appendEntry(entry)
            }
        cancellables.append(cancellableAddLog)

        let cancellableClear = NotificationCenter.default.publisher(for: .scriptWidgetConsoleLogClear)
            .sink { [weak self] _ in
                self?.consoleOutputs.removeAll()
            }
        cancellables.append(cancellableClear)

        print("PreviewView console object init :\(Unmanaged.passUnretained(self).toOpaque())")
    }

    deinit {
        print("PreviewView console object deinit :\(Unmanaged.passUnretained(self).toOpaque())")
        for cancellable in cancellables {
            cancellable.cancel()
        }
    }

    private func appendEntry(_ entry: ScriptWidgetConsoleEntry) {
        consoleOutputs.append(
            ScriptCodePreviewConsoleOutput(level: entry.level, message: entry.message)
        )
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
    @ObservedObject var data: ScriptCodePreviewConsoleDataObject

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
