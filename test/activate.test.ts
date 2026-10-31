// What activate() registers: the Export panel under core's old panel id, title
// and dock spot (so saved layouts keep it), and the stylesheet that gives it
// core's look.

import { describe, expect, it } from "vitest";
import { ExportPanel } from "../src/ExportPanel";
import { PANEL_ID, STYLESHEET_ID, activate } from "../src/index";
import { cls } from "../src/styles";
import { fakeApi } from "./support/fake-api";

describe("activate", () => {
  it("registers exactly the Export panel, as core's core.export did", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.panels).toEqual([
      {
        id: "core.export",
        title: "Export",
        component: ExportPanel,
        defaultDock: { module: "library", direction: "right", order: 1, width: 280 },
      },
    ]);
    expect(PANEL_ID).toBe("core.export");
  });

  it("registers one stylesheet for the panel's classes, coloured from the theme tokens", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.stylesheets.map((s) => s.id)).toEqual([STYLESHEET_ID]);
    const css = rig.stylesheets[0].css;
    expect(css).toContain(
      `:where(.${cls.opt}) { border-radius: 0.25rem; padding: 0.25rem 0.5rem; font-size: 11px; background-color: var(--color-surface-2); color: var(--color-text-muted); }`,
    );
    expect(css).toContain(`:where(.${cls.optActive}) { background-color: var(--color-surface-3); color: var(--color-text-primary); }`);
    expect(css).toContain("background-color: var(--color-slider-fill)");
    expect(css).toContain("font-family: var(--font-code)");
    expect(css).toContain(`:where(.${cls.exportButton}:disabled) { cursor: not-allowed; opacity: 0.4; }`);
  });

  it("styles every class it uses", () => {
    const rig = fakeApi();
    activate(rig.api);
    const css = rig.stylesheets[0].css;
    for (const name of Object.values(cls)) expect(css, name).toContain(`:where(.${name})`);
  });

  it("keeps every rule at zero specificity, below any stylesheet that restyles buttons or inputs", () => {
    const rig = fakeApi();
    activate(rig.api);
    const selectors = rig.stylesheets[0].css
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.includes("safelight-export") && !line.startsWith("html.sl-larger-text"))
      .flatMap((line) => line.slice(0, line.indexOf("{")).split(","))
      .map((s) => s.trim());
    expect(selectors.length).toBeGreaterThan(0);
    expect(selectors.filter((s) => !/^:where\([^()]*\)$/.test(s))).toEqual([]);
  });

  it("follows core's Larger text rules for the panel's 10 px and 11 px text", () => {
    const rig = fakeApi();
    activate(rig.api);
    const css = rig.stylesheets[0].css;
    expect(css).toMatch(new RegExp(`html\\.sl-larger-text \\.${cls.note}[^{]*\\{ font-size: 12px !important; \\}`));
    expect(css).toMatch(
      new RegExp(`html\\.sl-larger-text \\.${cls.opt}[^{]*\\{ font-size: 13px !important; line-height: 1\\.45 !important; \\}`),
    );
  });
});
