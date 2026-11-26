// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The panel's layout as plain CSS (the app's Tailwind build never scans an
// extension); the controls themselves come from `api.ui`. `:where()` drops
// every rule to zero specificity, so a stylesheet that restyles the panel (a
// user's own CSS) wins over them. The `html.sl-larger-text` rules repeat core's
// Accessibility ▸ Larger text rules for 10 px and 11 px text.

import type { UITokens } from "./safelight";

const P = "safelight-export";

export const cls = {
  root: P,
  stack: `${P}-stack`,
  grow: `${P}-grow`,
  presetRow: `${P}-preset-row`,
  warning: `${P}-warning`,
  note: `${P}-note`,
  hint: `${P}-hint`,
  dest: `${P}-dest`,
  empty: `${P}-empty`,
  fieldLabel: `${P}-field-label`,
  presetName: `${P}-preset-name`,
  footer: `${P}-footer`,
  summary: `${P}-summary`,
  actions: `${P}-actions`,
  presetForm: `${P}-preset-form`,
  status: `${P}-status`,
  statusShown: `${P}-status-shown`,
  failures: `${P}-failures`,
  failure: `${P}-failure`,
} as const;

const SMALL = [cls.note, cls.empty];
const LABEL = [cls.fieldLabel, cls.summary, cls.status, cls.failures];

const w = (name: string) => `:where(.${name})`;

export function exportCss(t: UITokens): string {
  return `
${w(cls.root)} { display: flex; flex-direction: column; }
${w(cls.stack)} { display: flex; flex-direction: column; gap: 0.25rem; }
${w(cls.grow)} { flex: 1; }
${w(cls.presetRow)} { display: flex; align-items: center; gap: 0.25rem; }
${w(cls.warning)} { margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
${w(cls.note)} { font-size: 10px; line-height: 1.375; color: ${t.textMuted}; }
${w(cls.hint)} { margin-top: 0.5rem; }
${w(cls.dest)} { color: ${t.textSecondary}; }
${w(cls.empty)} { font-size: 10px; color: ${t.textMuted}; }
${w(cls.fieldLabel)} { font-size: 11px; color: ${t.textSecondary}; }
${w(cls.presetName)} { width: 6rem; }
${w(cls.footer)} { padding: 0.75rem; }
${w(cls.summary)} { font-size: 11px; color: ${t.textSecondary}; }
${w(cls.actions)} { margin-top: 0.5rem; display: flex; gap: 0.25rem; }
${w(cls.presetForm)} { display: flex; gap: 0.25rem; }
${w(cls.status)} { font-size: 11px; color: ${t.textSecondary}; }
${w(cls.statusShown)} { margin-top: 0.75rem; }
${w(cls.failures)} { margin-top: 0.25rem; font-size: 11px; color: ${t.textSecondary}; }
${w(cls.failure)} { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
${SMALL.map((c) => `html.sl-larger-text .${c}`).join(", ")} { font-size: 12px !important; }
${LABEL.map((c) => `html.sl-larger-text .${c}`).join(", ")} { font-size: 13px !important; line-height: 1.45 !important; }
`;
}
