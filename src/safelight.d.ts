// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The slice of Safelight's extension API this extension touches, mirrored from
// the app's src/extensions/types.ts, src/extensions/registry.ts,
// src/extensions/ui-kit.tsx, src/modules/export/export-image.ts,
// src/project/native-fs.ts, src/state/catalog-store.ts and
// src/state/settings-store.ts. Extensions are standalone bundles, so the host's
// source is not on the type path; React types come from @types/react (dev only).

import type { ButtonHTMLAttributes, ComponentType, ReactNode } from "react";

export interface StoreApi<T> {
  (): T;
  <U>(selector: (state: T) => U): U;
  getState(): T;
  setState(partial: Partial<T> | ((s: T) => Partial<T>)): void;
  subscribe(listener: (state: T, prev: T) => void): () => void;
}

/** A catalog record. Core's carries much more; this extension only lists and
 *  counts photos and hands them back to `api.export.exportPhotos`. */
export interface CatalogPhoto {
  id: string;
  filename: string;
}

export interface CatalogStoreState {
  photos: CatalogPhoto[];
  selectedIds: Set<string>;
  activePhotoId: string | null;
}

export type ExportFormat = "image/jpeg" | "image/png" | "image/webp" | "image/tiff";

export type DeliveryMode = "zip" | "files" | "folder";

export type ColorSpaceId = "srgb" | "display-p3" | "adobe-rgb" | "prophoto-rgb";

/** Per-processor field values, keyed by processor id, then field key. */
export type ProcessorSettings = Record<string, Record<string, unknown>>;

export interface ExportPreset {
  name: string;
  format: ExportFormat;
  quality: number;
  longEdge: number | null;
  colorSpace: ColorSpaceId;
  sharpenAmount: number;
  sharpenRadius: number;
  /** Absent on presets saved before TIFF depth was stored. */
  tiffBitDepth?: 8 | 16;
  /** Absent on presets saved before PNG depth was stored. */
  pngBitDepth?: 8 | 16;
}

/** The Preferences ▸ Export part of the app's settings. */
export interface AppSettings {
  exportFormat: ExportFormat;
  /** 1–100. */
  exportQuality: number;
  /** null = original size. */
  exportLongEdge: number | null;
  exportColorSpace: ColorSpaceId;
  exportTiffBitDepth: 8 | 16;
  exportPngBitDepth: 8 | 16;
  exportIncludeMetadata: boolean;
  exportIncludeLocation: boolean;
  exportPresets: ExportPreset[];
}

export interface ExportSettings {
  format: ExportFormat;
  /** 0..1, used by JPEG and WebP. */
  quality: number;
  /** null = original (largest decodable) size. */
  longEdge: number | null;
  /** @deprecated core reads `delivery`; kept true for a ZIP as core sends it. */
  bundle: boolean;
  delivery: DeliveryMode;
  colorSpace?: ColorSpaceId;
  processorSettings?: ProcessorSettings;
  filenameTemplateId?: string;
  /** 0–150; 0 disables sharpening. */
  sharpenAmount?: number;
  /** Pixels, 0.3–3.0. */
  sharpenRadius?: number;
  tiffBitDepth?: 8 | 16;
  pngBitDepth?: 8 | 16;
  includeMetadata?: boolean;
  includeLocation?: boolean;
  /** A folder export's answer to a file of the same name already there:
   *  "number" writes beside it as "name (2).ext", "replace" writes over it.
   *  The original of a photo in the catalog is never replaced; it gets a
   *  number either way. Left out, the Preference decides. */
  ifExists?: "number" | "replace";
}

/** The output an export asks for, as an export processor is told it: the
 *  export settings without the delivery, the filename template or the
 *  processors' own settings. */
export type ExportOutput = Pick<
  ExportSettings,
  | "format"
  | "quality"
  | "longEdge"
  | "colorSpace"
  | "tiffBitDepth"
  | "pngBitDepth"
  | "sharpenAmount"
  | "sharpenRadius"
  | "includeMetadata"
  | "includeLocation"
>;

export interface ExportProgress {
  done: number;
  total: number;
  filename: string;
}

export interface ExportFailure {
  filename: string;
  reason: string;
}

export interface ExportResult {
  exported: number;
  /** Filenames that could not be rendered. */
  failed: string[];
  /** Why some of them failed, worded for the user, where that is known. */
  failures?: ExportFailure[];
  /** Photos whose 16-bit export fell back to 8-bit. */
  degradedTo8Bit: number;
  /** Photos whose 16-bit export was drawn at reduced (half float) precision. */
  reducedPrecision: number;
  /** A ZIP overflowed ZIP32 and was delivered as individual files. */
  zipFellBack?: boolean;
  /** The caller's signal ended the batch before every photo was tried;
   *  `exported` counts what was done by then. */
  cancelled?: true;
  /** Why the batch ended early on a failure every later write would meet too
   *  (a full disk, a read-only folder), worded for the user. */
  stopped?: string;
  /** Count of the exported photos drawn without an extension stage whose
   *  shader failed to build during the batch, so its effect is missing. */
  withoutStages?: number;
}

export interface ExportPhotosOptions {
  /** Stop before the next photo once this fires. */
  signal?: AbortSignal;
}

/** One settings field of an export processor's section in the Export panel. */
export type ExportProcessorField =
  | { key: string; label: string; hint?: string; type: "boolean"; default: boolean }
  | {
      key: string;
      label: string;
      hint?: string;
      type: "number";
      default: number;
      min?: number;
      max?: number;
      step?: number;
    }
  | { key: string; label: string; hint?: string; type: "string"; default: string; placeholder?: string }
  | {
      key: string;
      label: string;
      hint?: string;
      type: "select";
      default: string;
      options: { value: string; label: string }[];
    };

/** An export processor as the registry holds it. Core's also carries the
 *  `process` / `processPixels` steps, which core runs, not this panel. */
export interface RegisteredExportProcessor {
  id: string;
  label: string;
  settings?: ExportProcessorField[];
  extensionId: string;
  /** Insertion index; processors run in registration order. */
  order: number;
}

export interface RegisteredFilenameTemplate {
  id: string;
  label: string;
  template: string;
  extensionId: string;
}

export interface RegistryState {
  exportProcessors: Record<string, RegisteredExportProcessor>;
  filenameTemplates: Record<string, RegisteredFilenameTemplate>;
}

export interface PanelProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  /** Double-clicking the track resets to this. */
  defaultValue?: number;
  onChange: (value: number) => void;
}

export interface ResolutionControlProps {
  /** Long edge in pixels, null for the original size. */
  value: number | null;
  onChange: (v: number | null) => void;
  variant: "panel" | "preferences";
}

export interface PanelDockDefault {
  module: "library" | "develop";
  direction: "left" | "right" | "bottom";
  order?: number;
  width?: number;
  height?: number;
}

export interface PanelContribution {
  /** Globally unique, e.g. "core.histogram" or "my-ext.fancy-curves". */
  id: string;
  title: string;
  component: ComponentType;
  defaultDock?: PanelDockDefault;
}

/** A stylesheet applied to every app window after the core styles. Extension
 *  rules are unlayered, so they win over Tailwind utility classes at equal or
 *  lower specificity; disabling the extension removes the sheet. */
export interface StylesheetContribution {
  id: string;
  css: string;
}

/** `api.ui.Button`: a theme-styled button. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}

/** The theme's CSS variables as `var(--color-…)` strings. */
export interface UiTokens {
  readonly surface2: string;
  readonly surface3: string;
  readonly surface4: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textMuted: string;
  readonly sliderFill: string;
  readonly white: string;
  readonly fontCode: string;
}

export interface SafelightAPI {
  version: 1;
  extensionId: string;
  react: typeof import("react");
  registerPanel(c: PanelContribution): void;
  registerStylesheet(c: StylesheetContribution): void;
  ui: { tokens: UiTokens; Button: ComponentType<ButtonProps> };
  components: {
    Panel: ComponentType<PanelProps>;
    Slider: ComponentType<SliderProps>;
    /** The long-edge picker of the Export panel and Preferences ▸ Export. */
    ResolutionControl: ComponentType<ResolutionControlProps>;
  };
  stores: {
    useCatalogStore: StoreApi<CatalogStoreState>;
    useSettings: StoreApi<AppSettings>;
  };
  /** The contribution registry, read-only. React hook: select one record and
   *  derive arrays from it with useMemo. */
  registry: {
    use<T>(selector: (s: RegistryState) => T): T;
  };
  /** Write the app's Preferences: saved, with their side effects run. */
  appSettings: {
    update(patch: Partial<AppSettings>): void;
  };
  export: {
    /** Render, run the export processors, name and deliver the files
     *  (downloads, a ZIP, or into `destDir`). A full disk or a fired
     *  `options.signal` ends the batch early, with `stopped` or `cancelled`
     *  set on the result. */
    exportPhotos(
      photos: CatalogPhoto[],
      settings: ExportSettings,
      onProgress?: (p: ExportProgress) => void,
      destDir?: FileSystemDirectoryHandle,
      options?: ExportPhotosOptions,
    ): Promise<ExportResult>;
    /** True when these settings write ProPhoto RGB at 8 bits a channel. */
    proPhotoAt8Bit(
      settings: Pick<ExportSettings, "format" | "tiffBitDepth" | "pngBitDepth" | "colorSpace">,
    ): boolean;
  };
  project: {
    /** Ask for a folder to write into; null when cancelled. `id` lets the
     *  browser picker remember where it was last. */
    pickDirectory(id: string): Promise<FileSystemDirectoryHandle | null>;
    /** The absolute path behind a desktop folder handle, else null. */
    pathOf(handle: unknown): string | null;
    /** Show a path in the OS file manager; false outside the desktop app. */
    reveal(path: string): Promise<boolean>;
  };
}

export interface ExtensionModule {
  activate(api: SafelightAPI): void;
  deactivate?(): void;
}
