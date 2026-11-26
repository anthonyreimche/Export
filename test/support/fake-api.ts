// A stand-in Safelight API over real React and zustand, with only what this
// extension uses: reading any other member throws, naming it. The catalogue,
// settings and registry are real stores seeded the way core seeds them; Panel,
// Slider, ResolutionControl and the ui kit are small accessible stand-ins for
// core's components (the segmented control marks its chosen option with
// aria-pressed so tests can read it); `api.export` and `api.project` record
// their calls and answer with what the test queued. proPhotoAt8Bit is core's
// rule, and describeResult answers with a marker so a test sees the panel show
// core's wording rather than its own.

import * as React from "react";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import type {
  AppSettings,
  ButtonProps,
  CatalogPhoto,
  CatalogState,
  ExportPhotosOptions,
  ExportProgress,
  ExportResult,
  ExportSettings,
  PanelContribution,
  PanelProps,
  RegistryState,
  SafelightAPI,
  SegmentedControlProps,
  SliderProps,
  StylesheetContribution,
  TextInputProps,
  ToggleProps,
  UITokens,
} from "../../src/safelight";

type FakeCatalog = Pick<CatalogState, "photos" | "selectedIds" | "activePhotoId">;
type FakeSettings = Pick<
  AppSettings,
  | "exportFormat"
  | "exportQuality"
  | "exportLongEdge"
  | "exportColorSpace"
  | "exportTiffBitDepth"
  | "exportPngBitDepth"
  | "exportIncludeMetadata"
  | "exportIncludeLocation"
  | "exportPresets"
>;

export const TOKENS: Pick<
  UITokens,
  "surface2" | "surface3" | "surface4" | "textPrimary" | "textSecondary" | "textMuted" | "sliderFill" | "white" | "fontCode"
> = {
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
export const DEFAULT_SETTINGS: FakeSettings = {
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
  catalog: UseBoundStore<StoreApi<FakeCatalog>>;
  settings: UseBoundStore<StoreApi<FakeSettings>>;
  registry: UseBoundStore<StoreApi<RegistryState>>;
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

export const photo = (id: string): CatalogPhoto => ({
  id,
  filename: `${id}.RAF`,
  relPath: `${id}.RAF`,
  folder: "",
  directoryHandle: null,
  fileHandle: null,
  thumbnailBlob: null,
  thumbnailUrl: null,
  width: 6000,
  height: 4000,
  fileSize: 1,
  mimeType: "image/x-fuji-raf",
  rating: 0,
  colorLabel: "none",
  flag: "none",
  rotation: 0,
  keywords: [],
  dateCreated: 0,
  dateImported: 0,
  exif: {},
});

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

function FakeButton({ variant: _variant, size: _size, active: _active, full: _full, type = "button", ...rest }: ButtonProps) {
  return React.createElement("button", { type, ...rest });
}

function FakeToggle({ checked, onChange, label, ariaLabel }: ToggleProps) {
  return React.createElement(
    "label",
    null,
    label != null ? React.createElement("span", null, label) : null,
    React.createElement("button", {
      type: "button",
      role: "switch",
      "aria-checked": checked,
      "aria-label": ariaLabel ?? (typeof label === "string" ? label : undefined),
      onClick: () => onChange(!checked),
    }),
  );
}

function FakeTextInput({ value, onChange, ...rest }: TextInputProps) {
  return React.createElement("input", {
    type: "text",
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    ...rest,
  });
}

function FakeSegmentedControl({ value, onChange, options }: SegmentedControlProps) {
  return React.createElement(
    "div",
    null,
    options.map((o) =>
      React.createElement(
        "button",
        { key: o.value, type: "button", title: o.title, "aria-pressed": value === o.value, onClick: () => onChange(o.value) },
        o.label,
      ),
    ),
  );
}

function FakeResolutionControl({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  const option = (v: number | null, label: string) =>
    React.createElement("button", { key: label, "aria-pressed": value === v, onClick: () => onChange(v) }, label);
  return React.createElement("div", null, option(null, "Original"), option(2048, "2048 px"));
}

function proPhotoAt8Bit(s: Pick<ExportSettings, "format" | "tiffBitDepth" | "pngBitDepth" | "colorSpace">): boolean {
  const asks16 = (s.format === "image/tiff" && s.tiffBitDepth === 16) || (s.format === "image/png" && s.pngBitDepth === 16);
  return s.colorSpace === "prophoto-rgb" && !asks16;
}

function emptyRegistry(): RegistryState {
  return {
    panels: {},
    themes: {},
    sliderIcons: {},
    layouts: {},
    settings: {},
    pipelines: {},
    exportProcessors: {},
    filenameTemplates: {},
    processingStages: {},
    catalogHooks: {},
    presetImporters: {},
    gridFilters: {},
    gridMenuItems: {},
    slots: {},
    panelHeaderAccessories: {},
    librarySorts: {},
    stylesheets: {},
    modules: {},
    thumbnailBadges: {},
    commands: {},
    topBarButtons: {},
    windows: {},
    layoutMenus: {},
  };
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
  prefs?: Partial<FakeSettings>;
} = {}): Rig {
  const panels: PanelContribution[] = [];
  const stylesheets: StylesheetContribution[] = [];
  const updates: Partial<AppSettings>[] = [];
  const exports: ExportCall[] = [];
  const picks: string[] = [];
  const reveals: string[] = [];
  const pickQueue: (FileSystemDirectoryHandle | null)[] = [];
  const nextExport: Rig["nextExport"] = {};

  const catalog = create<FakeCatalog>()(() => ({
    photos,
    selectedIds: new Set(selected),
    activePhotoId: active,
  }));
  const settings = create<FakeSettings>()(() => ({ ...DEFAULT_SETTINGS, ...prefs }));
  const registry = create<RegistryState>()(emptyRegistry);

  const members = {
    version: 1 as const,
    extensionId: "safelight.export",
    react: React,
    registerPanel: (c: PanelContribution) => void panels.push(c),
    registerStylesheet: (c: StylesheetContribution) => void stylesheets.push(c),
    ui: {
      tokens: TOKENS,
      Button: FakeButton,
      Toggle: FakeToggle,
      TextInput: FakeTextInput,
      SegmentedControl: FakeSegmentedControl,
    },
    components: { Panel: FakePanel, Slider: FakeSlider, ResolutionControl: FakeResolutionControl },
    stores: { useSettings: settings },
    catalog: {
      useTargetPhotos: (): CatalogPhoto[] => {
        const all = catalog((s) => s.photos);
        const ids = catalog((s) => s.selectedIds);
        const activeId = catalog((s) => s.activePhotoId);
        return React.useMemo(
          () => (ids.size > 0 ? all.filter((p) => ids.has(p.id)) : all.filter((p) => p.id === activeId)),
          [all, ids, activeId],
        );
      },
    },
    registry: { use: <T>(selector: (s: RegistryState) => T): T => registry(selector) },
    appSettings: {
      update: (patch: Partial<AppSettings>) => {
        updates.push(patch);
        settings.setState(patch);
      },
    },
    export: {
      exportPhotos: (
        targets: CatalogPhoto[],
        run: ExportSettings,
        onProgress?: (p: ExportProgress) => void,
        destDir?: FileSystemDirectoryHandle,
        options?: ExportPhotosOptions,
      ): Promise<ExportResult> => {
        exports.push({ photos: targets, settings: run, destDir, onProgress, signal: options?.signal });
        if (nextExport.pending) return nextExport.pending;
        if (nextExport.error) return Promise.reject(nextExport.error);
        return Promise.resolve(nextExport.result ?? { ...RESULT, exported: targets.length });
      },
      proPhotoAt8Bit,
      describeResult: (r: ExportResult): string => `described: ${r.exported} exported, ${r.failed.length} failed`,
    },
    project: {
      pickDirectory: async (id: string) => {
        picks.push(id);
        return pickQueue.shift() ?? null;
      },
      pathOf: (handle: unknown) => (handle as Partial<FakeDir> | null)?.path ?? null,
      reveal: async (path: string) => {
        reveals.push(path);
        return true;
      },
    },
  };
  return {
    // The fake covers the members this extension reads; strict() throws on any other.
    api: strict(members, "api") as unknown as SafelightAPI,
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

/** Wraps a plain object so reading a member it lacks throws, naming the member. */
function strict<T extends object>(target: T, path: string): T {
  return new Proxy(target, {
    get(obj, key, receiver) {
      if (typeof key === "symbol" || key === "then" || key === "toJSON") return Reflect.get(obj, key, receiver);
      if (!(key in obj)) throw new Error(`The fake API has no ${path}.${key}. Add it to test/support/fake-api.ts.`);
      const value: unknown = Reflect.get(obj, key, receiver);
      const isPlainObject = typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype;
      return isPlainObject && key !== "react" && key !== "tokens" ? strict(value, `${path}.${key}`) : value;
    },
  });
}
