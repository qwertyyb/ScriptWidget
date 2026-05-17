//
//  ScriptWidgetRunningState.swift
//  ScriptWidget
//
//  Created by everettjf on 2022/4/7.
//

import Foundation

public extension Notification.Name {
    static let scriptWidgetConsoleLogAdded = Notification.Name("ScriptWidgetConsoleLogAdded")
    static let scriptWidgetConsoleLogClear = Notification.Name("ScriptWidgetConsoleLogClear")
}

public enum ScriptWidgetConsoleLevel: String {
    case log
    case info
    case warn
    case error
    case system
}

public struct ScriptWidgetConsoleEntry {
    public let level: ScriptWidgetConsoleLevel
    public let message: String

    public init(level: ScriptWidgetConsoleLevel, message: String) {
        self.level = level
        self.message = message
    }
}

class ScriptWidgetConsoleLogger {
    var logs: [ScriptWidgetConsoleEntry] = []

    func addLog(level: ScriptWidgetConsoleLevel, message: String) {
        let entry = ScriptWidgetConsoleEntry(level: level, message: message)
        DispatchQueue.main.async {
            self.logs.append(entry)
            NotificationCenter.default.post(name: .scriptWidgetConsoleLogAdded, object: entry)
        }
    }

    func clear() {
        DispatchQueue.main.async {
            self.logs.removeAll()
            NotificationCenter.default.post(name: .scriptWidgetConsoleLogClear, object: nil)
        }
    }
}

class ScriptWidgetRunningState {

    var logger: ScriptWidgetConsoleLogger
    var package: ScriptWidgetPackage

    init(package: ScriptWidgetPackage) {
        self.logger = ScriptWidgetConsoleLogger()
        self.package = package
    }
}

var sharedRunningState: ScriptWidgetRunningState? = nil
