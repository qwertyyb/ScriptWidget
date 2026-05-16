//
//  ScriptWidgetElementTagZStack.swift
//  ScriptWidget
//
//  Created by everettjf on 2021/2/18.
//

import Foundation
import SwiftUI

class ScriptWidgetElementTagZStack {
    
    static func buildView(_ element: ScriptWidgetRuntimeElement, _ context: ScriptWidgetElementContext) -> AnyView {
        return AnyView(ScriptWidgetElementTagZStack.buildZStack(element: element, context: context))
    }
    
    @ViewBuilder static func buildZStack(element: ScriptWidgetRuntimeElement, context: ScriptWidgetElementContext) -> some View {
        ZStack(alignment: Self.getAlignment(element)) {
            ForEach(element.childrenAsElements()) { item -> AnyView in
                return ScriptWidgetElementView.buildView(element: item, context: context)
            }
        }
        .modifier(ScriptWidgetAttributeGeneralModifier(element, context))
    }
    
    private static func getAlignment(_ element: ScriptWidgetRuntimeElement) -> Alignment {
        let justifyStr = element.getPropString("justify") ?? "center"
        let alignStr = element.getPropString("align") ?? "center"
        
        let h: HorizontalAlignment = {
            switch justifyStr {
            case "start": return .leading
            case "end": return .trailing
            default: return .center
            }
        }()
        
        let v: VerticalAlignment = {
            switch alignStr {
            case "start": return .top
            case "end": return .bottom
            default: return .center
            }
        }()
        
        return Alignment(horizontal: h, vertical: v)
    }
}
