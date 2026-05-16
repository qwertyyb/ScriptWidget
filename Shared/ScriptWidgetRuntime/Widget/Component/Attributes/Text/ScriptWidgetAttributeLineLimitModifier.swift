//
//  ScriptWidgetAttributeLineLimitModifier.swift
//  ScriptWidget
//

import SwiftUI

/*
 lineLimit={1}
 lineLimit="2"
 lineLimit="none"
 */
struct ScriptWidgetAttributeLineLimitModifier: ViewModifier {
    
    let lineLimit: Int?
    
    init(_ element: ScriptWidgetRuntimeElement) {
        self.lineLimit = Self.parseLineLimit(element)
    }
    
    @ViewBuilder
    func body(content: Content) -> some View {
        if let lineLimit = lineLimit {
            content.lineLimit(lineLimit)
        } else {
            content
        }
    }
    
    static func parseLineLimit(_ element: ScriptWidgetRuntimeElement) -> Int? {
        if let str = element.getPropString("lineLimit") {
            switch str.lowercased() {
            case "none", "unlimited", "infinity":
                return nil
            default:
                if let n = Int(str), n > 0 { return n }
                return nil
            }
        }
        if let n = element.getPropDouble("lineLimit") {
            let intN = Int(n)
            if intN > 0 { return intN }
        }
        return nil
    }
}
