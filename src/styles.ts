// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The look core gave the Export panel with Tailwind utilities, as plain CSS
// (the app's Tailwind build never scans an extension). Values are the ones
// core's built stylesheet resolves those utilities to. `:where()` drops every
// rule to zero specificity, so any stylesheet that restyles buttons or inputs
// (Custom Input Styling, a user's own CSS) wins over them as it wins over
// core's layered utilities. The `html.sl-larger-text` rules repeat core's
// Accessibility ▸ Larger text rules for 10 px and 11 px text.

import type { UiTokens } from "./safelight";

const P = "safelight-export";

export const cls = {
  root: P,
  stack: `${P}-stack`,
  segments: `${P}-segments`,
  choices: `${P}-choices`,
  opt: `${P}-opt`,
  optActive: `${P}-opt-active`,
  grow: `${P}-grow`,
  left: `${P}-left`,
  fixed: `${P}-fixed`,
  presetRow: `${P}-preset-row`,
  presetDelete: `${P}-preset-delete`,
  warning: `${P}-warning`,
  note: `${P}-note`,
  hint: `${P}-hint`,
  hintClose: `${P}-hint-close`,
  code: `${P}-code`,
  dest: `${P}-dest`,
  link: `${P}-link`,
  empty: `${P}-empty`,
  toggleRow: `${P}-toggle-row`,
  toggleLabel: `${P}-toggle-label`,
  checkbox: `${P}-checkbox`,
  fieldLabel: `${P}-field-label`,
  textInput: `${P}-text-input`,
  presetName: `${P}-preset-name`,
  footer: `${P}-footer`,
  summary: `${P}-summary`,
  actions: `${P}-actions`,
  exportButton: `${P}-export-button`,
  presetForm: `${P}-preset-form`,
  save: `${P}-save`,
  saveOpen: `${P}-save-open`,
  status: `${P}-status`,
  statusShown: `${P}-status-shown`,
  failures: `${P}-failures`,
  failure: `${P}-failure`,
  reveal: `${P}-reveal`,
} as const;

/** An option chip (format, bit depth, delivery, filename, select field). */
export const optClass = (active: boolean): string => (active ? `${cls.opt} ${cls.optActive}` : cls.opt);

const SMALL = [cls.presetDelete, cls.note, cls.empty];
const LABEL = [
  cls.opt,
  cls.toggleRow,
  cls.fieldLabel,
  cls.textInput,
  cls.summary,
  cls.save,
  cls.saveOpen,
  cls.status,
  cls.failures,
  cls.reveal,
];

const w = (name: string) => `:where(.${name})`;

export function exportCss(t: UiTokens): string {
  const focusRing = `box-shadow: 0 0 0 1px ${t.sliderFill};`;
  return `
${w(cls.root)} { display: flex; flex-direction: column; }
${w(cls.stack)} { display: flex; flex-direction: column; gap: 0.25rem; }
${w(cls.segments)} { display: flex; gap: 0.25rem; }
${w(cls.choices)} { display: flex; flex-wrap: wrap; gap: 0.25rem; }
${w(cls.opt)} { border-radius: 0.25rem; padding: 0.25rem 0.5rem; font-size: 11px; background-color: ${t.surface2}; color: ${t.textMuted}; }
${w(cls.optActive)} { background-color: ${t.surface3}; color: ${t.textPrimary}; }
${w(cls.grow)} { flex: 1; }
${w(cls.left)} { text-align: left; }
${w(cls.fixed)} { flex-shrink: 0; }
${w(cls.presetRow)} { display: flex; align-items: center; gap: 0.25rem; }
${w(cls.presetDelete)} { border-radius: 0.25rem; padding: 0.25rem 0.375rem; font-size: 10px; color: ${t.textMuted}; }
${w(cls.warning)} { margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
${w(cls.note)} { font-size: 10px; line-height: 1.375; color: ${t.textMuted}; }
${w(cls.hint)} { margin-top: 0.5rem; }
${w(cls.hintClose)} { margin-top: 0.25rem; }
${w(cls.code)} { font-family: ${t.fontCode}; }
${w(cls.dest)} { color: ${t.textSecondary}; }
${w(cls.link)} { text-decoration-line: underline; }
${w(cls.empty)} { font-size: 10px; color: ${t.textMuted}; }
${w(cls.toggleRow)} { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 11px; }
${w(cls.toggleLabel)} { color: ${t.textSecondary}; }
${w(cls.checkbox)} { accent-color: ${t.sliderFill}; }
${w(cls.fieldLabel)} { font-size: 11px; color: ${t.textSecondary}; }
${w(cls.textInput)} { border-radius: 0.25rem; background-color: ${t.surface2}; padding: 0.25rem 0.5rem; font-size: 11px; color: ${t.textPrimary}; outline-style: none; }
${w(`${cls.textInput}:focus`)} { ${focusRing} }
${w(cls.presetName)} { width: 6rem; }
${w(cls.footer)} { padding: 0.75rem; }
${w(cls.summary)} { font-size: 11px; color: ${t.textSecondary}; }
${w(cls.actions)} { margin-top: 0.5rem; display: flex; gap: 0.25rem; }
${w(cls.exportButton)} { flex: 1; border-radius: 0.25rem; background-color: ${t.sliderFill}; padding: 0.5rem 0.75rem; font-size: 0.75rem; line-height: calc(1 / 0.75); font-weight: 500; color: ${t.white}; }
${w(`${cls.exportButton}:disabled`)} { cursor: not-allowed; opacity: 0.4; }
${w(cls.presetForm)} { display: flex; gap: 0.25rem; }
${w(cls.save)} { border-radius: 0.25rem; background-color: ${t.surface3}; padding: 0.25rem 0.5rem; font-size: 11px; color: ${t.textPrimary}; }
${w(`${cls.save}:disabled`)} { opacity: 0.4; }
${w(cls.saveOpen)} { border-radius: 0.25rem; background-color: ${t.surface2}; padding: 0.25rem 0.5rem; font-size: 11px; color: ${t.textMuted}; }
${w(cls.status)} { font-size: 11px; color: ${t.textSecondary}; }
${w(cls.statusShown)} { margin-top: 0.75rem; }
${w(cls.failures)} { margin-top: 0.25rem; font-size: 11px; color: ${t.textSecondary}; }
${w(cls.failure)} { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
${w(cls.reveal)} { margin-top: 0.5rem; width: 100%; border-radius: 0.25rem; background-color: ${t.surface2}; padding: 0.375rem 0.75rem; font-size: 11px; color: ${t.textSecondary}; }
@media (hover: hover) {
  ${w(`${cls.opt}:hover`)}, ${w(`${cls.presetDelete}:hover`)}, ${w(`${cls.link}:hover`)}, ${w(`${cls.saveOpen}:hover`)} { color: ${t.textPrimary}; }
  ${w(`${cls.exportButton}:hover`)}, ${w(`${cls.save}:hover`)} { background-color: ${t.surface4}; }
  ${w(`${cls.reveal}:hover`)} { background-color: ${t.surface3}; color: ${t.textPrimary}; }
}
${SMALL.map((c) => `html.sl-larger-text .${c}`).join(", ")} { font-size: 12px !important; }
${LABEL.map((c) => `html.sl-larger-text .${c}`).join(", ")} { font-size: 13px !important; line-height: 1.45 !important; }
`;
}
