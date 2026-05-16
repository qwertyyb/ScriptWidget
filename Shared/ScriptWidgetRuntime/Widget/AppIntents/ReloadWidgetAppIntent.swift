//
//  ReloadWidgetAppIntent.swift
//  ScriptWidget
//
//  Created by ScriptWidget contributors.
//

import Foundation
import AppIntents
import WidgetKit

struct ReloadWidgetAppIntent: AppIntent {
    static var title: LocalizedStringResource = "Refresh JSWidget"
    static var description = IntentDescription("Refresh JSWidget timelines.")

    func perform() async throws -> some IntentResult {
        WidgetCenter.shared.reloadTimelines(ofKind: "JSWidget")
        return .result()
    }
}
