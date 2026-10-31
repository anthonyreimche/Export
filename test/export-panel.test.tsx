// The Export panel's bit depth and its ProPhoto warning, ported from core's
// export-panel.test.tsx. TIFF's and PNG's depths each seed from their own
// Preference, and PNG's defaults to 8, so no PNG turns 16-bit unasked. Presets
// carry the PNG depth, and an older preset without one leaves the panel's
// alone. ProPhoto written at 8 bits can band, so the panel says so under the
// format and offers a 16-bit TIFF, without ever blocking export.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ExportPanel } from "../src/ExportPanel";
import { React, initRuntime } from "../src/rt";
import type { AppSettings } from "../src/safelight";
import { fakeApi, type Rig } from "./support/fake-api";

afterEach(cleanup);

const WARNING = "ProPhoto at 8 bits can band in smooth gradients.";

function renderPanel(prefs: Partial<AppSettings>): Rig {
  const rig = fakeApi({ prefs });
  initRuntime(rig.api);
  render(<ExportPanel />);
  return rig;
}

const button = (name: string) => screen.getByRole("button", { name });
const pressed = (name: string) => button(name).getAttribute("aria-pressed");
const warning = () => screen.queryByText(WARNING);
const click = (name: string) => fireEvent.click(button(name));

describe("the ProPhoto warning", () => {
  it("shows for a ProPhoto JPEG", () => {
    renderPanel({ exportColorSpace: "prophoto-rgb", exportFormat: "image/jpeg" });
    expect(warning()).not.toBeNull();
  });

  it("hides for a ProPhoto 16-bit TIFF", () => {
    renderPanel({ exportColorSpace: "prophoto-rgb", exportFormat: "image/tiff", exportTiffBitDepth: 16 });
    expect(pressed("16-bit")).toBe("true");
    expect(warning()).toBeNull();
  });

  it("hides for an sRGB JPEG", () => {
    renderPanel({ exportColorSpace: "srgb", exportFormat: "image/jpeg" });
    expect(pressed("JPEG")).toBe("true");
    expect(warning()).toBeNull();
  });

  it("switches the export to a 16-bit TIFF from its button", () => {
    renderPanel({ exportColorSpace: "prophoto-rgb", exportFormat: "image/png", exportTiffBitDepth: 8 });
    click("Use 16-bit TIFF");

    expect(pressed("TIFF")).toBe("true");
    expect(pressed("PNG")).toBe("false");
    expect(pressed("16-bit")).toBe("true");
    expect(warning()).toBeNull();
  });
});

describe("the Bit Depth panel", () => {
  it("shows for PNG at 8 bits even when TIFF's Preference is 16", () => {
    renderPanel({ exportColorSpace: "prophoto-rgb", exportFormat: "image/png", exportTiffBitDepth: 16 });
    expect(pressed("8-bit")).toBe("true");
    expect(warning()).not.toBeNull();

    click("16-bit");
    expect(pressed("16-bit")).toBe("true");
    expect(warning()).toBeNull();
  });

  it("keeps TIFF's depth and PNG's apart", () => {
    renderPanel({ exportFormat: "image/tiff", exportTiffBitDepth: 16 });
    expect(pressed("16-bit")).toBe("true");

    click("PNG");
    expect(pressed("8-bit")).toBe("true");

    click("JPEG");
    expect(screen.queryByRole("button", { name: "8-bit" })).toBeNull();

    click("TIFF");
    expect(pressed("16-bit")).toBe("true");
  });
});

describe("the PNG depth Preference", () => {
  it("starts a PNG at 8-bit on a fresh store, whatever TIFF's default", () => {
    const rig = renderPanel({ exportFormat: "image/png", exportTiffBitDepth: 16 });
    expect(rig.settings.getState().exportPngBitDepth).toBe(8);
    expect(pressed("8-bit")).toBe("true");
    expect(pressed("16-bit")).toBe("false");
  });

  it("seeds a PNG at 16-bit when the Preference says so, leaving TIFF to its own", () => {
    renderPanel({ exportFormat: "image/png", exportPngBitDepth: 16, exportTiffBitDepth: 8 });
    expect(pressed("16-bit")).toBe("true");

    click("TIFF");
    expect(pressed("8-bit")).toBe("true");
  });
});

describe("export presets and the PNG depth", () => {
  const OLD_PRESET = {
    name: "Old",
    format: "image/png" as const,
    quality: 90,
    longEdge: null,
    colorSpace: "srgb" as const,
    sharpenAmount: 0,
    sharpenRadius: 1,
  };

  function savePreset(name: string) {
    click("Save...");
    fireEvent.change(screen.getByRole("textbox", { name: "Export preset name" }), { target: { value: name } });
    click("Save");
  }

  it("saves the PNG depth, and applies it when the preset is loaded", () => {
    const rig = renderPanel({ exportFormat: "image/png" });
    click("16-bit");
    savePreset("Archive");
    expect(rig.settings.getState().exportPresets[0]).toMatchObject({ name: "Archive", pngBitDepth: 16 });

    click("8-bit");
    click("JPEG");
    click("Archive");

    expect(pressed("PNG")).toBe("true");
    expect(pressed("16-bit")).toBe("true");
  });

  it("saves an 8-bit PNG as 8, and loading it turns the depth back down", () => {
    const rig = renderPanel({ exportFormat: "image/png" });
    savePreset("Web");
    expect(rig.settings.getState().exportPresets[0].pngBitDepth).toBe(8);

    click("16-bit");
    click("Web");
    expect(pressed("8-bit")).toBe("true");
  });

  it("leaves the panel's PNG depth alone for a preset saved before it existed", () => {
    renderPanel({ exportFormat: "image/jpeg", exportPresets: [OLD_PRESET] });
    click("Old");
    expect(pressed("PNG")).toBe("true");
    expect(pressed("8-bit")).toBe("true");

    click("16-bit");
    click("Old");
    expect(pressed("16-bit")).toBe("true");
  });
});
