//
//  ScriptWidgetRuntimeFile.swift
//  ScriptWidget
//
//  Created by everettjf on 2022/4/1.
//

import Foundation
import JavaScriptCore

@objc protocol ScriptWidgetRuntimeFileExports: JSExport {
    static func readString(_ path: String) -> String
    /// Exported as `writeStringFile` to avoid clashing with NSObject selectors when bridged to JS.
    static func writeStringFile(_ path: String, _ content: String) -> Bool
    static func remove(_ path: String) -> Bool
    static func list(_ path: String) -> [String]
}

@objc public class ScriptWidgetRuntimeFile: NSObject, ScriptWidgetRuntimeFileExports {
    static func readString(_ path: String) -> String {
        guard let runningState = sharedRunningState else {
            return ""
        }
        return runningState.package.readString(relativePath: path)
    }

    static func writeStringFile(_ path: String, _ content: String) -> Bool {
        guard let runningState = sharedRunningState else {
            return false
        }
        return runningState.package.writeString(relativePath: path, content: content)
    }

    static func remove(_ path: String) -> Bool {
        guard let runningState = sharedRunningState else {
            return false
        }
        return runningState.package.remove(relativePath: path)
    }

    static func list(_ path: String) -> [String] {
        guard let runningState = sharedRunningState else {
            return []
        }
        return runningState.package.listDirectory(relativePath: path)
    }
}
