// A stand-in Safelight API over real React and zustand. The catalogue, settings
// and registry are real stores seeded the way core seeds them; Panel, Slider
// and ResolutionControl are small accessible stand-ins for core's components;
// `api.export` and `api.project` record their calls and answer with what the
// test queued. proPhotoAt8Bit is core's rule.

import * as React from "react";
import { create } from "zustand";
import type {
  AppSettings,
  ButtonProps,
  CatalogPhoto,
  CatalogStoreState,
  ExportProgress,
  ExportResult,
  ExportSettings,
  PanelContribution,
  PanelProps,
  RegistryState,
  ResolutionControlProps,
  SafelightAPI,
  SliderProps,
  StoreApi,
  StylesheetContribution,
  UiTokens,
} from "../../src/safelight";

export const TOKENS: UiTokens = {
  surface2: "var(--color-surface-2)",
  surface3: "var(--color-surface-3)",
  surface4: "var(--color-surface-4)",
  textPrimary: "var(--color-text-primary)",
  textSecondary: "var(--color-text-secondary)",
  textMuted: "var(--color-text-muted)",
  sliderFill: "var(--color-slider-fill)",
  white: "var(--color-white)",
  fontCode: "var(--font-code)",
};

/** Core's Preferences ▸ Export defaults (src/state/settings-store.ts). */
export const DEFAULT_SETTINGS: AppSettings = {
  exportFormat: "image/jpeg",
  exportQuality: 90,
  exportLongEdge: null,
  exportColorSpace: "srgb",
  exportTiffBitDepth: 16,
  exportPngBitDepth: 8,
  exportIncludeMetadata: false,
  exportIncludeLocation: false,
  exportPresets: [],
};

/** A folder handle as the desktop hands one over: it knows its path. */
export interface FakeDir extends FileSystemDirectoryHandle {
  readonly path: string | null;
}

export function fakeDir(name: string, path: string | null = null): FakeDir {
  return { name, kind: "directory", path } as FakeDir;
}

export interface ExportCall {
  photos: CatalogPhoto[];
  settings: ExportSettings;
  destDir: FileSystemDirectoryHandle | undefined;
  onProgress: ((p: ExportProgress) => void) | undefined;
  signal: AbortSignal | undefined;
}

export interface Rig {
  api: SafelightAPI;
  catalog: StoreApi<CatalogStoreState>;
  settings: StoreApi<AppSettings>;
  registry: StoreApi<RegistryState>;
  panels: PanelContribution[];
  stylesheets: StylesheetContribution[];
  /** Every `api.appSettings.update` patch, in order. */
  updates: Partial<AppSettings>[];
  exports: ExportCall[];
  /** What the next `exportPhotos` call resolves to (or rejects with). */
  nextExport: { result?: ExportResult; error?: Error; pending?: Promise<ExportResult> };
  /** Folders the picker hands back, in order; an empty queue is a cancel. */
  pickQueue: (FileSystemDirectoryHandle | null)[];
  picks: string[];
  reveals: string[];
}

export const photo = (id: string): CatalogPhoto => ({ id, filename: `${id}.RAF` });

export const RESULT: ExportResult = { exported: 0, failed: [], degradedTo8Bit: 0, reducedPrecision: 0 };

function FakePanel({ title, defaultOpen = true, children }: PanelProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  return React.createElement(
    "section",
    { "aria-label": title },
    React.createElement("button", { onClick: () => setOpen(!open), "aria-expanded": open }, title),
    open ? children : null,
  );
}

function FakeSlider({ label, value, min, max, step, onChange }: SliderProps) {
  return React.createElement("input", {
    type: "range",
    "aria-label": label || "value",
    value,
    min,
    max,
    step,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value)),
  });
}

function FakeButton({ variant: _variant, size: _size, type = "button", ...rest }: ButtonProps) {
  return React.createElement("button", { type, ...rest });
}

function FakeResolutionControl({ value, onChange }: ResolutionControlProps) {
  const option = (v: number | null, label: string) =>
    React.createElement("button", { key: label, "aria-pressed": value === v, onClick: () => onChange(v) }, label);
  return React.createElement("div", null, option(null, "Original"), option(2048, "2048 px"));
}

function proPhotoAt8Bit(s: Pick<ExportSettings, "format" | "tiffBitDepth" | "pngBitDepth" | "colorSpace">): boolean {
  const asks16 = (s.format === "image/tiff" && s.tiffBitDepth === 16) || (s.format === "image/png" && s.pngBitDepth === 16);
  return s.colorSpace === "prophoto-rgb" && !asks16;
}

export function fakeApi({
  photos = [],
  selected = [],
  active = null,
  prefs = {},
}: {
  photos?: CatalogPhoto[];
  selected?: string[];
  active?: string | null;
  prefs?: Partial<AppSettings>;
} = {}): Rig {
  const panels: PanelContribution[] = [];
  const stylesheets: StylesheetContribution[] = [];
  const updates: Partial<AppSettings>[] = [];
  const exports: ExportCall[] = [];
  const picks: string[] = [];
  const reveals: string[] = [];
  const pickQueue: (FileSystemDirectoryHandle | null)[] = [];
  const nextExport: Rig["nextExport"] = {};

  const catalog = create<CatalogStoreState>()(() => ({
    photos,
    selectedIds: new Set(selected),
    activePhotoId: active,
  }));
  const settings = create<AppSettings>()(() => ({ ...DEFAULT_SETTINGS, ...prefs }));
  const registry = create<RegistryState>()(() => ({ exportProcessors: {}, filenameTemplates: {} }));

  const api: SafelightAPI = {
    version: 1,
    extensionId: "safelight.export",
    react: React,
    registerPanel: (c) => void panels.push(c),
    registerStylesheet: (c) => void stylesheets.push(c),
    ui: { tokens: TOKENS, Button: FakeButton },
    components: { Panel: FakePanel, Slider: FakeSlider, ResolutionControl: FakeResolutionControl },
    stores: { useCatalogStore: catalog, useSettings: settings },
    registry: { use: (selector) => registry(selector) },
    appSettings: {
      update: (patch) => {
        updates.push(patch);
        settings.setState(patch);
      },
    },
    export: {
      exportPhotos: (targets, run, onProgress, destDir, options) => {
        exports.push({ photos: targets, settings: run, destDir, onProgress, signal: options?.signal });
        if (nextExport.pending) return nextExport.pending;
        if (nextExport.error) return Promise.reject(nextExport.error);
        return Promise.resolve(nextExport.result ?? { ...RESULT, exported: targets.length });
      },
      proPhotoAt8Bit,
    },
    project: {
      pickDirectory: async (id) => {
        picks.push(id);
        return pickQueue.shift() ?? null;
      },
      pathOf: (handle) => (handle as Partial<FakeDir> | null)?.path ?? null,
      reveal: async (path) => {
        reveals.push(path);
        return true;
      },
    },
  };
  return {
    api,
    catalog,
    settings,
    registry,
    panels,
    stylesheets,
    updates,
    exports,
    nextExport,
    pickQueue,
    picks,
    reveals,
  };
}
