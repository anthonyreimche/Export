// The panel's export run over the fake API: which photos it exports, the
// delivery choices and the folder picker, the settings it hands to core's
// exportPhotos, what it shows when the run ends, and the sections extensions
// contribute (export processors, filename templates).

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ExportPanel } from "../src/ExportPanel";
import { React, initRuntime } from "../src/rt";
import type { AppSettings, CatalogPhoto, ExportResult, RegistryState } from "../src/safelight";
import { RESULT, fakeApi, fakeDir, photo, type Rig } from "./support/fake-api";

afterEach(cleanup);

const A = photo("a");
const B = photo("b");
const C = photo("c");

function mount(
  opts: { photos?: CatalogPhoto[]; selected?: string[]; active?: string | null; prefs?: Partial<AppSettings> } = {},
): Rig {
  const rig = fakeApi({ photos: [A, B, C], ...opts });
  initRuntime(rig.api);
  render(<ExportPanel />);
  return rig;
}

const button = (name: string) => screen.getByRole("button", { name });
const exportButton = () => screen.getByRole<HTMLButtonElement>("button", { name: /^Export( \d+)?$/ });
const status = () => screen.getByRole("status").textContent;

async function runExport() {
  await act(async () => {
    fireEvent.click(exportButton());
  });
}

describe("what the panel exports", () => {
  it("asks for a selection while there is none", () => {
    mount();
    expect(screen.getByText("Select one or more photos in the Library to export.")).not.toBeNull();
    expect(exportButton().textContent).toBe("Export");
    expect(exportButton().disabled).toBe(true);
  });

  it("exports the selection, in catalog order", async () => {
    const rig = mount({ selected: ["c", "a"] });
    expect(screen.getByText("2 photos ready as JPEG.")).not.toBeNull();
    expect(exportButton().textContent).toBe("Export 2");

    rig.pickQueue.push(fakeDir("Out"));
    await runExport();
    expect(rig.exports.map((e) => e.photos)).toEqual([[A, C]]);
  });

  it("falls back to the active photo with nothing selected", async () => {
    const rig = mount({ active: "b" });
    expect(screen.getByText("1 photo ready as JPEG.")).not.toBeNull();
    await runExport();
    expect(rig.exports.map((e) => e.photos)).toEqual([[B]]);
  });

  it("follows the selection as it changes", () => {
    const rig = mount({ selected: ["a"] });
    act(() => rig.catalog.setState({ selectedIds: new Set(["a", "b", "c"]) }));
    expect(exportButton().textContent).toBe("Export 3");
  });
});

describe("delivery", () => {
  it("offers ZIP, Files and Folder for several photos, Folder first", () => {
    mount({ selected: ["a", "b"] });
    expect(screen.getByText("A folder picker will open on export.")).not.toBeNull();
    fireEvent.click(button("ZIP"));
    expect(screen.getByText("All photos in a single ZIP download.")).not.toBeNull();
    fireEvent.click(button("Files"));
    expect(screen.getByText("One download prompt per photo.")).not.toBeNull();
  });

  it("offers only Files for a single photo", () => {
    mount({ selected: ["a"] });
    expect(screen.queryByRole("button", { name: "ZIP" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Folder" })).toBeNull();
    expect(screen.getByText("One download prompt per photo.")).not.toBeNull();
  });

  it("opens the folder picker on export and sends the files into the folder picked", async () => {
    const rig = mount({ selected: ["a", "b"] });
    const out = fakeDir("Out");
    rig.pickQueue.push(out);
    await runExport();

    expect(rig.picks).toEqual(["safelight-export"]);
    expect(rig.exports[0].destDir).toBe(out);
    expect(rig.exports[0].settings).toMatchObject({ delivery: "folder", bundle: false });
    expect(screen.getByText("Out")).not.toBeNull();
  });

  it("exports nothing when the folder picker is cancelled", async () => {
    const rig = mount({ selected: ["a", "b"] });
    await runExport();
    expect(rig.picks).toHaveLength(1);
    expect(rig.exports).toEqual([]);
  });

  it("keeps the picked folder for the next export, and changes it from the note", async () => {
    const rig = mount({ selected: ["a", "b"] });
    rig.pickQueue.push(fakeDir("Out"));
    await runExport();
    await runExport();
    expect(rig.picks).toHaveLength(1);

    rig.pickQueue.push(fakeDir("Elsewhere"));
    await act(async () => {
      fireEvent.click(button("Change..."));
    });
    expect(screen.getByText("Elsewhere")).not.toBeNull();
    await runExport();
    expect(rig.exports[2].destDir?.name).toBe("Elsewhere");
  });

  it("sends a ZIP as one bundle, with no folder", async () => {
    const rig = mount({ selected: ["a", "b"] });
    fireEvent.click(button("ZIP"));
    await runExport();
    expect(rig.picks).toEqual([]);
    expect(rig.exports[0].destDir).toBeUndefined();
    expect(rig.exports[0].settings).toMatchObject({ delivery: "zip", bundle: true });
  });
});

describe("the settings an export runs with", () => {
  it("takes the Preferences defaults, quality as 0..1, and the metadata opt-ins", async () => {
    const rig = mount({
      active: "a",
      prefs: {
        exportQuality: 80,
        exportLongEdge: 2048,
        exportColorSpace: "display-p3",
        exportIncludeMetadata: true,
        exportIncludeLocation: true,
      },
    });
    await runExport();
    expect(rig.exports[0].settings).toEqual({
      format: "image/jpeg",
      tiffBitDepth: 16,
      pngBitDepth: 8,
      quality: 0.8,
      longEdge: 2048,
      bundle: false,
      delivery: "files",
      colorSpace: "display-p3",
      processorSettings: {},
      filenameTemplateId: undefined,
      sharpenAmount: 0,
      sharpenRadius: 1,
      includeMetadata: true,
      includeLocation: true,
    });
  });

  it("takes the panel's own choices", async () => {
    const rig = mount({ active: "a" });
    fireEvent.click(button("TIFF"));
    fireEvent.click(button("8-bit"));
    fireEvent.click(button("2048 px"));
    fireEvent.click(button("Output Sharpening"));
    fireEvent.change(screen.getByRole("slider", { name: "Amount" }), { target: { value: "40" } });
    expect(screen.queryByText("Off. Increase amount to sharpen after resize.")).toBeNull();
    await runExport();
    expect(rig.exports[0].settings).toMatchObject({
      format: "image/tiff",
      tiffBitDepth: 8,
      longEdge: 2048,
      sharpenAmount: 40,
    });
  });

  it("hides Quality for the lossless formats", () => {
    mount();
    expect(screen.queryByRole("button", { name: "Quality" })).not.toBeNull();
    fireEvent.click(button("PNG"));
    expect(screen.queryByRole("button", { name: "Quality" })).toBeNull();
  });

  it("says in Privacy what the Preferences let through", () => {
    const rig = mount();
    fireEvent.click(button("Privacy"));
    expect(screen.getByText(/^Exports carry no EXIF or location metadata\./)).not.toBeNull();
    act(() => rig.settings.setState({ exportIncludeMetadata: true }));
    expect(screen.getByText(/GPS location is stripped/)).not.toBeNull();
    act(() => rig.settings.setState({ exportIncludeLocation: true }));
    expect(screen.getByText(/GPS location tags are copied/)).not.toBeNull();
  });
});

describe("the end of a run", () => {
  it("shows progress while it runs and the status line after", async () => {
    const rig = mount({ selected: ["a", "b"] });
    fireEvent.click(button("Files"));
    let finish: (r: ExportResult) => void = () => {};
    rig.nextExport.pending = new Promise((resolve) => (finish = resolve));
    await runExport();
    expect(exportButton).toThrow();
    expect(button("Exporting 0/2...").hasAttribute("disabled")).toBe(true);
    act(() => rig.exports[0].onProgress?.({ done: 1, total: 2, filename: "a.RAF" }));
    expect(button("Exporting 1/2...")).not.toBeNull();

    await act(async () => finish({ ...RESULT, exported: 1, failed: ["b.RAF"], failures: [{ filename: "b.RAF", reason: "The original isn't available." }] }));
    expect(status()).toBe("Exported 1; 1 could not be exported.");
    expect(screen.getByRole("listitem").textContent).toBe("b.RAF: The original isn't available.");
    expect(exportButton().textContent).toBe("Export 2");
  });

  it("cancels a run from its Cancel button and says how many it exported", async () => {
    const rig = mount({ selected: ["a", "b", "c"] });
    fireEvent.click(button("Files"));
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
    let finish: (r: ExportResult) => void = () => {};
    rig.nextExport.pending = new Promise((resolve) => (finish = resolve));
    await runExport();

    const signal = rig.exports[0].signal;
    expect(signal?.aborted).toBe(false);
    fireEvent.click(button("Cancel"));
    expect(signal?.aborted).toBe(true);
    expect(button("Cancel").hasAttribute("disabled")).toBe(true);

    await act(async () => finish({ ...RESULT, exported: 1, cancelled: true }));
    expect(status()).toBe("Cancelled after exporting 1 photo.");
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });

  it("hands each run a fresh signal", async () => {
    const rig = mount({ active: "a" });
    await runExport();
    await runExport();
    expect(rig.exports[0].signal).toBeInstanceOf(AbortSignal);
    expect(rig.exports[1].signal).not.toBe(rig.exports[0].signal);
    expect(rig.exports[1].signal?.aborted).toBe(false);
  });

  it("says why a run stopped early and how many it wrote", async () => {
    const rig = mount({ selected: ["a", "b", "c"] });
    fireEvent.click(button("Files"));
    rig.nextExport.result = { ...RESULT, exported: 2, failed: ["c.RAF"], stopped: "the disk is full" };
    await runExport();
    expect(status()).toBe("Stopped: the disk is full, after exporting 2 photos.");
  });

  it("says why when the export throws", async () => {
    const rig = mount({ active: "a" });
    rig.nextExport.error = new Error("WebGL is unavailable");
    await runExport();
    expect(status()).toBe("Export failed: WebGL is unavailable");
  });

  it("offers Open Folder after a desktop folder export, revealing that path", async () => {
    const rig = mount({ selected: ["a", "b"] });
    rig.pickQueue.push(fakeDir("Out", "D:\\Photos\\Out"));
    await runExport();
    await act(async () => {
      fireEvent.click(button("Open Folder"));
    });
    expect(rig.reveals).toEqual(["D:\\Photos\\Out"]);
  });

  it("offers no Open Folder where the folder has no path, or nothing landed", async () => {
    const rig = mount({ selected: ["a", "b"] });
    rig.pickQueue.push(fakeDir("Out"));
    await runExport();
    expect(screen.queryByRole("button", { name: "Open Folder" })).toBeNull();

    cleanup();
    const rig2 = mount({ selected: ["a", "b"] });
    rig2.pickQueue.push(fakeDir("Out", "D:\\Out"));
    rig2.nextExport.result = { ...RESULT, exported: 0, failed: ["a.RAF", "b.RAF"] };
    await runExport();
    expect(screen.queryByRole("button", { name: "Open Folder" })).toBeNull();
    expect(rig.reveals).toEqual([]);
  });
});

describe("presets", () => {
  it("deletes a preset through the app settings", () => {
    const keep = { name: "Keep", format: "image/png" as const, quality: 90, longEdge: null, colorSpace: "srgb" as const, sharpenAmount: 0, sharpenRadius: 1 };
    const drop = { ...keep, name: "Drop" };
    const rig = mount({ prefs: { exportPresets: [keep, drop] } });
    fireEvent.click(screen.getAllByTitle("Delete preset")[1]);
    expect(rig.updates).toEqual([{ exportPresets: [keep] }]);
    expect(screen.queryByRole("button", { name: "Drop" })).toBeNull();
  });

  it("replaces a preset saved under the same name", () => {
    const old = { name: "Web", format: "image/png" as const, quality: 90, longEdge: null, colorSpace: "srgb" as const, sharpenAmount: 0, sharpenRadius: 1 };
    const rig = mount({ prefs: { exportPresets: [old] } });
    fireEvent.click(button("Save..."));
    const name = screen.getByRole("textbox", { name: "Export preset name" });
    expect(button("Save").hasAttribute("disabled")).toBe(true);
    fireEvent.change(name, { target: { value: "  Web " } });
    fireEvent.click(button("Save"));
    expect(rig.settings.getState().exportPresets).toEqual([
      { ...old, format: "image/jpeg", tiffBitDepth: 16, pngBitDepth: 8 },
    ]);
    expect(button("Save...")).not.toBeNull();
  });

  it("closes the name field on Escape without saving", () => {
    const rig = mount();
    fireEvent.click(button("Save..."));
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Export preset name" }), { key: "Escape" });
    expect(button("Save...")).not.toBeNull();
    expect(rig.updates).toEqual([]);
  });
});

describe("what extensions contribute", () => {
  const processors: RegistryState["exportProcessors"] = {
    "ext.mark": {
      id: "ext.mark",
      label: "Watermark",
      extensionId: "ext",
      order: 1,
      settings: [
        { key: "text", label: "Text", type: "string", default: "©", placeholder: "Your name" },
        { key: "enabled", label: "Enabled", type: "boolean", default: false },
        { key: "corner", label: "Corner", type: "select", default: "br", options: [{ value: "br", label: "Bottom right" }, { value: "tl", label: "Top left" }] },
        { key: "size", label: "Size", type: "number", default: 10, min: 1, max: 50 },
      ],
    },
    "ext.first": { id: "ext.first", label: "Runs First", extensionId: "ext", order: 0 },
  };

  it("gives each export processor a section, in run order, enabled toggle first", () => {
    const rig = mount({ active: "a" });
    act(() => rig.registry.setState({ exportProcessors: processors }));
    const titles = screen.getAllByRole("button", { expanded: false }).map((b) => b.textContent);
    expect(titles.indexOf("Runs First")).toBeLessThan(titles.indexOf("Watermark"));

    fireEvent.click(button("Runs First"));
    expect(screen.getByText("No settings.")).not.toBeNull();

    fireEvent.click(button("Watermark"));
    const section = screen.getByRole("region", { name: "Watermark" });
    const labels = [...section.querySelectorAll("label > span, div > span")].map((s) => s.textContent);
    expect(labels).toEqual(["Enabled", "Text", "Corner"]);
    expect(screen.getByRole("slider", { name: "Size" })).not.toBeNull();
  });

  it("sends the processor fields the person set", async () => {
    const rig = mount({ active: "a" });
    act(() => rig.registry.setState({ exportProcessors: processors }));
    fireEvent.click(button("Watermark"));
    fireEvent.click(screen.getByRole("checkbox", { name: "Enabled" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Text" }), { target: { value: "AR" } });
    fireEvent.click(button("Top left"));
    fireEvent.change(screen.getByRole("slider", { name: "Size" }), { target: { value: "20" } });
    expect(button("Top left").className).toContain("safelight-export-opt-active");

    await runExport();
    expect(rig.exports[0].settings.processorSettings).toEqual({
      "ext.mark": { enabled: true, text: "AR", corner: "tl", size: 20 },
    });
  });

  it("offers the filename templates, showing the one picked, and forgets it when it goes", async () => {
    const rig = mount({ active: "a" });
    expect(screen.queryByRole("button", { name: "Filename" })).toBeNull();
    act(() =>
      rig.registry.setState({
        filenameTemplates: { "ext.date": { id: "ext.date", label: "By date", template: "{year}-{month}-{filename}", extensionId: "ext" } },
      }),
    );
    fireEvent.click(button("Filename"));
    fireEvent.click(button("By date"));
    expect(screen.getByText("{year}-{month}-{filename}")).not.toBeNull();
    await runExport();
    expect(rig.exports[0].settings.filenameTemplateId).toBe("ext.date");

    act(() => rig.registry.setState({ filenameTemplates: {} }));
    await runExport();
    expect(rig.exports[1].settings.filenameTemplateId).toBeUndefined();
  });
});
