//
//  DocsOverlayView.swift
//  ScriptWidget
//

import SwiftUI

struct DocsOverlayView: View {
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            DocsCatalogView()
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button {
                            dismiss()
                        } label: {
                            Label("Close", systemImage: "xmark")
                                .labelStyle(.iconOnly)
                        }
                    }
                }
        }
    }
}

struct DocsOverlayView_Previews: PreviewProvider {
    static var previews: some View {
        DocsOverlayView()
    }
}
