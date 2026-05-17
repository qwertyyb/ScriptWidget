//
//  SwiftWidgetRuntimeConsole.swift
//  ScriptWidget
//
//  Created by everettjf on 2020/10/15.
//

import Foundation
import JavaScriptCore

@objc protocol ScriptWidgetRuntimeConsoleExports: JSExport {
    static func log(_ string: String) -> Void
    static func info(_ string: String) -> Void
    static func warn(_ string: String) -> Void
    static func error(_ string: String) -> Void
}

@objc public class ScriptWidgetRuntimeConsole: NSObject, ScriptWidgetRuntimeConsoleExports {
    class func log(_ string: String) {
        write(level: .log, message: string)
    }

    class func info(_ string: String) {
        write(level: .info, message: string)
    }

    class func warn(_ string: String) {
        write(level: .warn, message: string)
    }

    class func error(_ string: String) {
        write(level: .error, message: string)
    }

    private class func write(level: ScriptWidgetConsoleLevel, message: String) {
        if let runningState = sharedRunningState {
            runningState.logger.addLog(level: level, message: message)
        }
        print("console \(level.rawValue) : \(message)")
    }
}
