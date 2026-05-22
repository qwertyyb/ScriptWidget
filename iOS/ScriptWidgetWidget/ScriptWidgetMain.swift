//
//  ScriptWidgetWidget.swift
//  ScriptWidgetWidget
//
//  Created by everettjf on 2020/10/4.
//

import WidgetKit
import SwiftUI
import Intents
import Combine

struct ScriptWidgetMainWidget: Widget {

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: "JSWidget", intent: ScriptWidgetAppIntent.self, provider: ScriptWidgetTimelineProvider()) { entry in
            ScriptWidgetWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("JSWidget")
        .description("Build widgets with JavaScript")
        .supportedFamilies([
            .systemSmall, .systemMedium, .systemLarge,
            .systemExtraLarge,
            .accessoryInline, .accessoryCircular, .accessoryRectangular,
        ])
        .contentMarginsDisabled()
    }
    
    init() {
        let _ = sharedAppState
    }
}

@main
struct ScriptWidgets: WidgetBundle {
    @WidgetBundleBuilder
    var body: some Widget {
        ScriptWidgetMainWidget()
        ScriptLiveActivityWidget()
        if #available(iOSApplicationExtension 18.0, *) {
            ScriptWidgetControlWidget()
        }
    }
}
