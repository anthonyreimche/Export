// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Registers the Library "Export" panel. It was core's built-in `core.export`
// until Safelight 3.2.0 and keeps that panel id, so saved layouts keep it
// where it was.

import { ExportPanel } from "./ExportPanel";
import { initRuntime } from "./rt";
import type { SafelightAPI } from "./safelight";
import { exportCss } from "./styles";

export const PANEL_ID = "core.export";
export const STYLESHEET_ID = "safelight.export.styles";

export function activate(host: SafelightAPI): void {
  initRuntime(host);
  host.registerStylesheet({ id: STYLESHEET_ID, css: exportCss(host.ui.tokens) });
  host.registerPanel({
    id: PANEL_ID,
    title: "Export",
    component: ExportPanel,
    defaultDock: { module: "library", direction: "right", order: 1, width: 280 },
  });
}
