# Export for Safelight

The Library **Export** panel: export the selected photos (or the photo you
have open) with format, size and quality options.

- **Format:** JPEG, PNG, WebP or TIFF. PNG and TIFF offer 8 or 16 bits, each
  starting from its own Preferences default. ProPhoto RGB at 8 bits can band,
  so the panel says so and offers a 16-bit TIFF instead.
- **Quality** (JPEG, WebP), **Resolution** (long edge, or the original size)
  and **Output Sharpening** after the resize.
- **Delivery:** a ZIP, one download per photo, or into a folder you pick. After
  a folder export on the desktop, **Open Folder** shows it.
- **Presets:** save the current settings under a name and load them again.
- Sections for the export processors and filename templates other extensions
  add.

The starting settings come from Preferences ▸ Export, and so does whether
camera and location metadata go into the files. Rendering and encoding are
Safelight's own; this extension is the panel that drives them.

Until Safelight 3.2.0 this panel was built in. It keeps the built-in panel's
id (`core.export`), so layouts saved before then keep it where it was.

## Development

```bash
npm install
npm run typecheck
npm run build    # dist/index.js, the file Safelight loads
npm test         # vitest; the bundle checks read dist/, so build first
npm run check    # all three, in that order
```

Safelight hands the extension its own React through `api.react`, so the
bundle never includes React. `src/safelight.d.ts` mirrors the part of the
app's extension API the extension uses.

## Licence

GPL-3.0-only with an attribution term (GPL v3 §7b), the same licence as Safelight; see LICENSE. Copyright (C) 2026 Anthony Reimche.
