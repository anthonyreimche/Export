// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

import type { ExportResult } from "./safelight";

/** The Export panel's line on a finished batch: how many photos it exported,
 *  and any that fell short of what was asked. A copy of core's
 *  `exportStatus` (src/modules/export/export-image.ts). */
export function exportStatus(result: ExportResult): string {
  const photos = `${result.exported} photo${result.exported === 1 ? "" : "s"}`;
  const when = result.exported === 0 ? "before exporting any photos" : `after exporting ${photos}`;
  let msg: string;
  if (result.stopped) msg = `Stopped: ${result.stopped}, ${when}.`;
  else if (result.cancelled) msg = `Cancelled ${when}.`;
  else if (result.failed.length === 0) msg = `Exported ${photos}.`;
  else msg = `Exported ${result.exported}; ${result.failed.length} could not be exported.`;
  if (result.degradedTo8Bit > 0) {
    msg += ` ${result.degradedTo8Bit} exported as 8-bit (device can't render 16-bit).`;
  }
  if (result.reducedPrecision > 0) {
    msg += ` ${result.reducedPrecision} exported at reduced 16-bit precision (device can't render full precision).`;
  }
  if (result.withoutStages) {
    msg += ` ${result.withoutStages} exported without an extension's effect (its shader failed to build).`;
  }
  if (result.zipFellBack) {
    msg += " ZIP exceeded 4 GiB; delivered as individual files.";
  }
  return msg;
}
