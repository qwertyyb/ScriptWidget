//
//  ScriptWidgetElementTagSpacer.swift
//  ScriptWidget
//
//  Created by everettjf on 2021/2/18.
//

import Foundation
import SwiftUI

class ScriptWidgetElementTagSpacer {
    static func buildView(_ element: ScriptWidgetRuntimeElement, _ context: ScriptWidgetElementContext) -> AnyView {
        if let length = element.getPropDouble("length") {
            let fixedLength = CGFloat(length)
            return AnyView(
                Spacer(minLength: fixedLength)
                    .frame(width: fixedLength, height: fixedLength)
                    .fixedSize()
                    .modifier(ScriptWidgetAttributeFrameModifier(element))
            )
        }
        
        if let minLength = element.getPropDouble("minLength") {
            return AnyView(
                Spacer(minLength: CGFloat(minLength))
                    .modifier(ScriptWidgetAttributeFrameModifier(element))
            )
        }
        
        return AnyView(
            Spacer()
                .modifier(ScriptWidgetAttributeFrameModifier(element))
        )
    }
}
