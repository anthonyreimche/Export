// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Export as a dock panel (View > Export from either module): format, quality,
// resolution and delivery settings plus the export action, in one column.
// Rendering, encoding and delivery stay in core, behind `api.export`.

import { ExportFailureList } from "./ExportFailureList";
import { exportStatus } from "./export-status";
import { React, api } from "./rt";
import type {
  ColorSpaceId,
  DeliveryMode,
  ExportFormat,
  ExportPreset,
  ExportProcessorField,
  ExportResult,
  ExportSettings,
  ProcessorSettings,
} from "./safelight";
import { cls, optClass } from "./styles";

const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WebP" },
  { value: "image/tiff", label: "TIFF" },
];

const BIT_DEPTHS: { value: 8 | 16; label: string }[] = [
  { value: 8, label: "8-bit" },
  { value: 16, label: "16-bit" },
];

const PICKER_ID = "safelight-export";

/** One settings field of an export processor, styled like the panel's own
 *  controls (toggles, sliders, text inputs, button-group selects). */
function ProcessorFieldRow({
  field,
  value,
  onChange,
}: {
  field: ExportProcessorField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const { Slider } = api.components;

  if (field.type === "boolean") {
    const checked = typeof value === "boolean" ? value : field.default;
    return (
      <label className={cls.toggleRow}>
        <span className={cls.toggleLabel}>{field.label}</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={cls.checkbox}
        />
      </label>
    );
  }

  if (field.type === "number") {
    const num = typeof value === "number" ? value : field.default;
    return (
      <Slider
        label={field.label}
        value={num}
        min={field.min ?? 0}
        max={field.max ?? 100}
        step={field.step}
        defaultValue={field.default}
        onChange={(v) => onChange(v)}
      />
    );
  }

  if (field.type === "string") {
    const str = typeof value === "string" ? value : field.default;
    return (
      <label className={cls.stack}>
        <span className={cls.fieldLabel}>{field.label}</span>
        <input
          type="text"
          value={str}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cls.textInput}
        />
      </label>
    );
  }

  if (field.type === "select") {
    const sel = typeof value === "string" ? value : field.default;
    return (
      <div className={cls.stack}>
        <span className={cls.fieldLabel}>{field.label}</span>
        <div className={cls.choices}>
          {field.options.map((opt) => (
            <button key={opt.value} onClick={() => onChange(opt.value)} className={optClass(sel === opt.value)}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function ExportPanel() {
  const { Panel, Slider, ResolutionControl } = api.components;
  const { Button } = api.ui;
  const { useCatalogStore, useSettings } = api.stores;
  const photos = useCatalogStore((s) => s.photos);
  const selectedIds = useCatalogStore((s) => s.selectedIds);
  const activePhotoId = useCatalogStore((s) => s.activePhotoId);

  // Defaults come from Preferences > Export; the panel state is per-session.
  const seed = () => useSettings.getState();
  const [format, setFormat] = React.useState<ExportFormat>(() => seed().exportFormat);
  const [quality, setQuality] = React.useState(() => seed().exportQuality);
  const [longEdge, setLongEdge] = React.useState<number | null>(() => seed().exportLongEdge);
  const [tiffBitDepth, setTiffBitDepth] = React.useState<8 | 16>(() => seed().exportTiffBitDepth);
  const [pngBitDepth, setPngBitDepth] = React.useState<8 | 16>(() => seed().exportPngBitDepth);
  const [colorSpace, setColorSpace] = React.useState<ColorSpaceId>(() => seed().exportColorSpace);
  // Metadata embedding is a Preferences-only opt-in (privacy promise: exports
  // ship clean unless the user decides otherwise app-wide, not per export).
  const includeMetadata = useSettings((s) => s.exportIncludeMetadata);
  const includeLocation = useSettings((s) => s.exportIncludeLocation);
  const [delivery, setDelivery] = React.useState<DeliveryMode>("folder");
  const [destDir, setDestDir] = React.useState<FileSystemDirectoryHandle | null>(null);
  const [busy, setBusy] = React.useState(false);
  const runRef = React.useRef<AbortController | null>(null);
  const [cancelling, setCancelling] = React.useState(false);
  const [progress, setProgress] = React.useState<{ done: number; total: number } | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [failures, setFailures] = React.useState<ExportResult["failures"]>(undefined);
  // Absolute path of the last folder export that landed files on the desktop:
  // what "Open Folder" reveals. The browser has no path to offer.
  const [exportedDir, setExportedDir] = React.useState<string | null>(null);

  const [sharpenAmount, setSharpenAmount] = React.useState(0);
  const [sharpenRadius, setSharpenRadius] = React.useState(1.0);

  const presets = useSettings((s) => s.exportPresets);
  const [savingPreset, setSavingPreset] = React.useState(false);
  const [presetName, setPresetName] = React.useState("");

  const rawProcessors = api.registry.use((s) => s.exportProcessors);
  const rawTemplates = api.registry.use((s) => s.filenameTemplates);
  const exportProcessors = React.useMemo(
    () => Object.values(rawProcessors).sort((a, b) => a.order - b.order),
    [rawProcessors],
  );
  const filenameTemplates = React.useMemo(() => Object.values(rawTemplates), [rawTemplates]);

  const [processorSettings, setProcessorSettings] = React.useState<ProcessorSettings>({});
  // undefined = the built-in base name + extension.
  const [filenameTemplateId, setFilenameTemplateId] = React.useState<string | undefined>();

  // Drop the chosen template when its extension unregisters it.
  React.useEffect(() => {
    if (filenameTemplateId !== undefined && !filenameTemplates.some((t) => t.id === filenameTemplateId)) {
      setFilenameTemplateId(undefined);
    }
  }, [filenameTemplates, filenameTemplateId]);

  const setProcField = (procId: string, key: string, value: unknown) => {
    setProcessorSettings((prev) => ({
      ...prev,
      [procId]: { ...(prev[procId] ?? {}), [key]: value },
    }));
  };

  // The selection, else the single active photo.
  const targets = React.useMemo(() => {
    if (selectedIds.size > 0) return photos.filter((p) => selectedIds.has(p.id));
    if (activePhotoId) {
      const p = photos.find((ph) => ph.id === activePhotoId);
      return p ? [p] : [];
    }
    return [];
  }, [photos, selectedIds, activePhotoId]);

  const hasQuality = format === "image/jpeg" || format === "image/webp";
  const isTiff = format === "image/tiff";
  const hasBitDepth = isTiff || format === "image/png";
  const bitDepth = isTiff ? tiffBitDepth : pngBitDepth;
  const setBitDepth = isTiff ? setTiffBitDepth : setPngBitDepth;
  // The warning and the export read the same depth fields, so the warning's
  // tests also guard what the export is asked for.
  const depth = { format, tiffBitDepth, pngBitDepth };
  const bandsAt8Bit = api.export.proPhotoAt8Bit({ ...depth, colorSpace });

  // ZIP and Folder are multi-photo only: a single photo goes back to Files.
  React.useEffect(() => {
    if (targets.length === 1 && (delivery === "zip" || delivery === "folder")) {
      setDelivery("files");
    }
  }, [targets.length, delivery]);

  const loadPreset = (preset: ExportPreset) => {
    setFormat(preset.format);
    setQuality(preset.quality);
    setLongEdge(preset.longEdge);
    setSharpenAmount(preset.sharpenAmount);
    setSharpenRadius(preset.sharpenRadius);
    setColorSpace(preset.colorSpace);
    if (preset.tiffBitDepth) setTiffBitDepth(preset.tiffBitDepth);
    if (preset.pngBitDepth) setPngBitDepth(preset.pngBitDepth);
  };

  const savePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    const preset: ExportPreset = {
      name,
      format,
      quality,
      longEdge,
      colorSpace,
      sharpenAmount,
      sharpenRadius,
      tiffBitDepth,
      pngBitDepth,
    };
    const existing = presets.filter((p) => p.name !== name);
    api.appSettings.update({ exportPresets: [...existing, preset] });
    setSavingPreset(false);
    setPresetName("");
  };

  const deletePreset = (name: string) => {
    api.appSettings.update({ exportPresets: presets.filter((p) => p.name !== name) });
  };

  const pickFolder = async () => {
    const dir = await api.project.pickDirectory(PICKER_ID);
    if (dir) {
      setDestDir(dir);
      setDelivery("folder");
    }
  };

  const handleExport = async () => {
    if (busy || targets.length === 0) return;
    let dir = destDir;
    if (delivery === "folder" && !dir) {
      dir = await api.project.pickDirectory(PICKER_ID);
      if (!dir) return;
      setDestDir(dir);
    }

    const run = new AbortController();
    runRef.current = run;
    setBusy(true);
    setCancelling(false);
    setStatus(null);
    setFailures(undefined);
    setExportedDir(null);
    setProgress({ done: 0, total: targets.length });

    const settings: ExportSettings = {
      ...depth,
      quality: quality / 100,
      longEdge,
      bundle: delivery === "zip",
      delivery,
      colorSpace,
      processorSettings,
      filenameTemplateId,
      sharpenAmount,
      sharpenRadius,
      includeMetadata,
      includeLocation,
    };
    try {
      const result = await api.export.exportPhotos(
        targets,
        settings,
        (p) => setProgress({ done: p.done, total: p.total }),
        dir ?? undefined,
        { signal: run.signal },
      );
      setStatus(exportStatus(result));
      setFailures(result.failures);
      if (delivery === "folder" && result.exported > 0) {
        const revealPath = dir ? api.project.pathOf(dir) : null;
        if (revealPath) setExportedDir(revealPath);
      }
    } catch (e) {
      setStatus(`Export failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      runRef.current = null;
      setBusy(false);
      setCancelling(false);
      setProgress(null);
    }
  };

  const cancelExport = () => {
    runRef.current?.abort();
    setCancelling(true);
  };

  const template =
    filenameTemplateId === undefined ? undefined : filenameTemplates.find((t) => t.id === filenameTemplateId);

  return (
    <div className={cls.root}>
      {presets.length > 0 && (
        <Panel title="Preset">
          <div className={cls.stack}>
            {presets.map((p) => (
              <div key={p.name} className={cls.presetRow}>
                <button onClick={() => loadPreset(p)} className={`${cls.grow} ${cls.left} ${optClass(false)}`}>
                  {p.name}
                </button>
                <button onClick={() => deletePreset(p.name)} className={cls.presetDelete} title="Delete preset">
                  {"×"}
                </button>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Format">
        <div className={cls.segments}>
          {FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFormat(f.value)}
              aria-pressed={format === f.value}
              className={`${cls.grow} ${optClass(format === f.value)}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {bandsAt8Bit && (
          <div className={cls.warning}>
            <p className={`${cls.grow} ${cls.note}`}>ProPhoto at 8 bits can band in smooth gradients.</p>
            <button
              onClick={() => {
                setFormat("image/tiff");
                setTiffBitDepth(16);
              }}
              className={`${cls.fixed} ${optClass(false)}`}
            >
              Use 16-bit TIFF
            </button>
          </div>
        )}
      </Panel>

      {hasBitDepth && (
        <Panel title="Bit Depth">
          <div className={cls.segments}>
            {BIT_DEPTHS.map((d) => (
              <button
                key={d.value}
                onClick={() => setBitDepth(d.value)}
                aria-pressed={bitDepth === d.value}
                className={`${cls.grow} ${optClass(bitDepth === d.value)}`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className={`${cls.note} ${cls.hint}`}>
            {bitDepth === 16
              ? "16-bit keeps the full editing precision for further work. Output sharpening is applied at 8-bit only."
              : "8-bit is smaller and universally compatible."}
          </p>
        </Panel>
      )}

      {hasQuality && (
        <Panel title="Quality">
          <Slider label="" value={quality} min={1} max={100} defaultValue={90} onChange={setQuality} />
        </Panel>
      )}

      <Panel title="Resolution">
        <ResolutionControl variant="panel" value={longEdge} onChange={setLongEdge} />
        <p className={`${cls.note} ${cls.hint}`}>Long edge. Output is capped at the largest decodable size.</p>
      </Panel>

      <Panel title="Output Sharpening" defaultOpen={false}>
        <Slider
          label="Amount"
          value={sharpenAmount}
          min={0}
          max={150}
          step={1}
          defaultValue={0}
          onChange={setSharpenAmount}
        />
        <Slider
          label="Radius"
          value={sharpenRadius}
          min={0.3}
          max={3}
          step={0.1}
          defaultValue={1}
          onChange={setSharpenRadius}
        />
        {sharpenAmount === 0 && (
          <p className={`${cls.note} ${cls.hintClose}`}>Off. Increase amount to sharpen after resize.</p>
        )}
      </Panel>

      <Panel title="Delivery">
        <div className={cls.segments}>
          {targets.length !== 1 && (
            <button onClick={() => setDelivery("zip")} className={`${cls.grow} ${optClass(delivery === "zip")}`}>
              ZIP
            </button>
          )}
          <button onClick={() => setDelivery("files")} className={`${cls.grow} ${optClass(delivery === "files")}`}>
            Files
          </button>
          {targets.length !== 1 && (
            <button
              onClick={() => setDelivery("folder")}
              className={`${cls.grow} ${optClass(delivery === "folder")}`}
            >
              Folder
            </button>
          )}
        </div>
        {delivery === "folder" ? (
          <p className={`${cls.note} ${cls.hint}`}>
            {destDir ? (
              <>
                Saving to <span className={cls.dest}>{destDir.name}</span>.{" "}
                <button onClick={() => void pickFolder()} className={cls.link}>
                  Change...
                </button>
              </>
            ) : (
              "A folder picker will open on export."
            )}
          </p>
        ) : delivery === "zip" ? (
          <p className={`${cls.note} ${cls.hint}`}>All photos in a single ZIP download.</p>
        ) : (
          <p className={`${cls.note} ${cls.hint}`}>One download prompt per photo.</p>
        )}
      </Panel>

      {filenameTemplates.length > 0 && (
        <Panel title="Filename" defaultOpen={false}>
          <div className={cls.stack}>
            <button
              onClick={() => setFilenameTemplateId(undefined)}
              className={`${cls.left} ${optClass(filenameTemplateId === undefined)}`}
            >
              Default
            </button>
            {filenameTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilenameTemplateId(t.id)}
                className={`${cls.left} ${optClass(filenameTemplateId === t.id)}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {template && <p className={`${cls.note} ${cls.hint} ${cls.code}`}>{template.template}</p>}
        </Panel>
      )}

      {exportProcessors.map((proc) => {
        const fields = proc.settings ?? [];
        const procVals = processorSettings[proc.id] ?? {};
        const isEnabledField = (f: ExportProcessorField) => f.key === "enabled" && f.type === "boolean";
        const enabledField = fields.find(isEnabledField);
        const otherFields = fields.filter((f) => !isEnabledField(f));

        return (
          <Panel key={proc.id} title={proc.label} defaultOpen={false}>
            {enabledField && (
              <ProcessorFieldRow
                key="enabled"
                field={enabledField}
                value={procVals.enabled}
                onChange={(v) => setProcField(proc.id, "enabled", v)}
              />
            )}
            {otherFields.map((field) => (
              <ProcessorFieldRow
                key={field.key}
                field={field}
                value={procVals[field.key]}
                onChange={(v) => setProcField(proc.id, field.key, v)}
              />
            ))}
            {fields.length === 0 && <p className={cls.empty}>No settings.</p>}
          </Panel>
        );
      })}

      <div className={cls.footer}>
        <p className={cls.summary}>
          {targets.length === 0
            ? "Select one or more photos in the Library to export."
            : `${targets.length} photo${targets.length === 1 ? "" : "s"} ready as ${format.split("/")[1].toUpperCase()}.`}
        </p>
        <div className={cls.actions}>
          <button
            onClick={() => void handleExport()}
            disabled={busy || targets.length === 0}
            className={cls.exportButton}
          >
            {busy && progress
              ? `Exporting ${progress.done}/${progress.total}...`
              : targets.length > 0
                ? `Export ${targets.length}`
                : "Export"}
          </button>
          {busy && (
            <Button size="sm" onClick={cancelExport} disabled={cancelling}>
              Cancel
            </Button>
          )}
          {savingPreset ? (
            <form
              className={cls.presetForm}
              onSubmit={(e) => {
                e.preventDefault();
                savePreset();
              }}
            >
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name"
                aria-label="Export preset name"
                autoFocus
                className={`${cls.textInput} ${cls.presetName}`}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSavingPreset(false);
                }}
              />
              <button type="submit" disabled={!presetName.trim()} className={cls.save}>
                Save
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSavingPreset(true)}
              className={cls.saveOpen}
              title="Save current settings as a preset"
            >
              Save...
            </button>
          )}
        </div>
        {/* Kept mounted so the live region announces the first result too. */}
        <p role="status" aria-live="polite" className={status ? `${cls.status} ${cls.statusShown}` : cls.status}>
          {status}
        </p>
        <ExportFailureList failures={failures} />
        {exportedDir && (
          <button onClick={() => void api.project.reveal(exportedDir)} className={cls.reveal}>
            Open Folder
          </button>
        )}
      </div>

      <Panel title="Privacy" defaultOpen={false}>
        <p className={cls.note}>
          {includeMetadata
            ? includeLocation
              ? "Camera, exposure and GPS location tags are copied into exported files, as set in Preferences > Export."
              : "Camera and exposure tags are copied into exported files; GPS location is stripped. Configured in Preferences > Export."
            : "Exports carry no EXIF or location metadata. Metadata can be enabled in Preferences > Export."}{" "}
          Everything is rendered locally; nothing leaves your device.
        </p>
      </Panel>
    </div>
  );
}
