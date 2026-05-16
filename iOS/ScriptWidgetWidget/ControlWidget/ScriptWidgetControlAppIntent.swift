//
//  ScriptWidgetControlAppIntent.swift
//  ScriptWidget
//
//  Created by eevv on 11/5/24.
//
import SwiftUI
import WidgetKit
import AppIntents


struct ScriptWidgetControlAppIntent: AppIntent {
  static var title: LocalizedStringResource = "JSWidget control app intent"
  static var description = IntentDescription("JSWidget control app intent description")
  static var isDiscoverable: Bool { false }

  init() {
  }

  func perform() async throws -> some IntentResult {
    print("JSWidget control app intent performed")
    return .result()
  }
}
