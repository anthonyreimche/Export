// The line the panel shows on a finished batch. Ported from core's
// export-image.test.ts ("the export status line"), since this extension keeps
// its own copy of exportStatus.

import { describe, expect, it } from "vitest";
import { exportStatus } from "../src/export-status";
import type { ExportResult } from "../src/safelight";

describe("the export status line", () => {
  const result = (counts: Partial<ExportResult>): ExportResult => ({
    exported: 3,
    failed: [],
    degradedTo8Bit: 0,
    reducedPrecision: 0,
    ...counts,
  });

  it("reads as it always has without reduced precision", () => {
    expect(exportStatus(result({}))).toBe("Exported 3 photos.");
    expect(exportStatus(result({ exported: 1 }))).toBe("Exported 1 photo.");
    expect(exportStatus(result({ exported: 2, failed: ["c.RAF"] }))).toBe("Exported 2; 1 could not be exported.");
    expect(exportStatus(result({ degradedTo8Bit: 2 }))).toBe(
      "Exported 3 photos. 2 exported as 8-bit (device can't render 16-bit).",
    );
    expect(exportStatus(result({ zipFellBack: true }))).toBe(
      "Exported 3 photos. ZIP exceeded 4 GiB; delivered as individual files.",
    );
  });

  it("names the photos at reduced 16-bit precision beside those at 8-bit", () => {
    expect(exportStatus(result({ degradedTo8Bit: 1, reducedPrecision: 2, zipFellBack: true }))).toBe(
      "Exported 3 photos. 1 exported as 8-bit (device can't render 16-bit). " +
        "2 exported at reduced 16-bit precision (device can't render full precision). " +
        "ZIP exceeded 4 GiB; delivered as individual files.",
    );
  });
});
