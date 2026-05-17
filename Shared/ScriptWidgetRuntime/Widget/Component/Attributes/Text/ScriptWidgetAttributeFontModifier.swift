//
//  ScriptWidgetAttributeFontModifier.swift
//  ScriptWidget
//
//  Created by everettjf on 2021/2/21.
//

import Foundation
import SwiftUI

/*
 font="title"
 font={17}
 font={{ weight: "bold" }}
 font={{ name: "body", weight: "bold", design: "rounded" }}
 font={{ size: 14, weight: "bold", design: "rounded" }}
 */
struct ScriptWidgetAttributeFontModifier: ViewModifier {

    let font: Font?

    init(_ element: ScriptWidgetRuntimeElement, fontField: String) {
        switch element.getPropValue(fontField) {
        case .string(let name):
            if let size = Double(name) {
                self.font = Self.systemFont(size: CGFloat(size), weight: nil, design: nil)
            } else {
                self.font = Self.semanticFont(name: name, weight: nil, design: nil)
            }
        case .number(let size):
            self.font = Self.systemFont(size: CGFloat(size), weight: nil, design: nil)
        case .dict(let dict):
            self.font = Self.getFontFromDict(dict)
        case nil:
            self.font = nil
        }
    }

    init(_ element: ScriptWidgetRuntimeElement) {
        self.init(element, fontField: "font")
    }

    @ViewBuilder
    func body(content: Content) -> some View {
        if let font = self.font {
            content.font(font)
        } else {
            content
        }
    }

  /// Priority: `size` → fixed system font; otherwise semantic (`name`, default `body`) with `weight` / `design`.
    static func getFontFromDict(_ dict: [String: Any]) -> Font? {
        let weight = (dict["weight"] as? String).flatMap { getFontWeightFromStringName($0) }
        let design = (dict["design"] as? String).flatMap { getFontDesignFromStringName($0) }

        if let size = (dict["size"] as? NSNumber)?.doubleValue {
            return systemFont(size: CGFloat(size), weight: weight, design: design)
        }

        let name = (dict["name"] as? String) ?? "body"
        return semanticFont(name: name, weight: weight, design: design)
    }

    static func semanticFont(name: String, weight: Font.Weight?, design: Font.Design?) -> Font? {
        guard let style = textStyle(from: name) else {
            return semanticFont(name: "body", weight: weight, design: design)
        }
        return .system(style, design: design ?? .default, weight: weight ?? .regular)
    }

    static func systemFont(size: CGFloat, weight: Font.Weight?, design: Font.Design?) -> Font {
        let resolvedWeight = weight ?? .regular
        if let design = design, design != .default {
            return .system(size: size, weight: resolvedWeight, design: design)
        }
        if weight != nil {
            return .system(size: size, weight: resolvedWeight)
        }
        return .system(size: size)
    }

    static func textStyle(from name: String) -> Font.TextStyle? {
        switch name {
        case "largeTitle": return .largeTitle
        case "title": return .title
        case "title2": return .title2
        case "title3": return .title3
        case "headline": return .headline
        case "subheadline": return .subheadline
        case "body": return .body
        case "callout": return .callout
        case "footnote": return .footnote
        case "caption": return .caption
        case "caption2": return .caption2
        default: return nil
        }
    }

    static func getFontWeightFromStringName(_ name: String) -> Font.Weight? {
        switch name {
        case "ultraLight": return .ultraLight
        case "thin": return .thin
        case "light": return .light
        case "regular": return .regular
        case "medium": return .medium
        case "semibold": return .semibold
        case "bold": return .bold
        case "heavy": return .heavy
        case "black": return .black
        default: return nil
        }
    }

    static func getFontDesignFromStringName(_ name: String) -> Font.Design? {
        switch name {
        case "monospaced": return .monospaced
        case "rounded": return .rounded
        case "serif": return .serif
        case "default": return .default
        default: return nil
        }
    }
}
