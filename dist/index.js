//#region src/rt.ts
var e, t;
function n(n) {
	t = n, e = n.react;
}
//#endregion
//#region src/styles.ts
var r = "safelight-export", i = {
	root: r,
	stack: `${r}-stack`,
	segments: `${r}-segments`,
	choices: `${r}-choices`,
	opt: `${r}-opt`,
	optActive: `${r}-opt-active`,
	grow: `${r}-grow`,
	left: `${r}-left`,
	fixed: `${r}-fixed`,
	presetRow: `${r}-preset-row`,
	presetDelete: `${r}-preset-delete`,
	warning: `${r}-warning`,
	note: `${r}-note`,
	hint: `${r}-hint`,
	hintClose: `${r}-hint-close`,
	code: `${r}-code`,
	dest: `${r}-dest`,
	link: `${r}-link`,
	empty: `${r}-empty`,
	toggleRow: `${r}-toggle-row`,
	toggleLabel: `${r}-toggle-label`,
	checkbox: `${r}-checkbox`,
	fieldLabel: `${r}-field-label`,
	textInput: `${r}-text-input`,
	presetName: `${r}-preset-name`,
	footer: `${r}-footer`,
	summary: `${r}-summary`,
	actions: `${r}-actions`,
	exportButton: `${r}-export-button`,
	presetForm: `${r}-preset-form`,
	save: `${r}-save`,
	saveOpen: `${r}-save-open`,
	status: `${r}-status`,
	statusShown: `${r}-status-shown`,
	failures: `${r}-failures`,
	failure: `${r}-failure`,
	reveal: `${r}-reveal`
}, a = (e) => e ? `${i.opt} ${i.optActive}` : i.opt, o = [
	i.presetDelete,
	i.note,
	i.empty
], s = [
	i.opt,
	i.toggleRow,
	i.fieldLabel,
	i.textInput,
	i.summary,
	i.save,
	i.saveOpen,
	i.status,
	i.failures,
	i.reveal
], c = (e) => `:where(.${e})`;
function l(e) {
	let t = `box-shadow: 0 0 0 1px ${e.sliderFill};`;
	return `
${c(i.root)} { display: flex; flex-direction: column; }
${c(i.stack)} { display: flex; flex-direction: column; gap: 0.25rem; }
${c(i.segments)} { display: flex; gap: 0.25rem; }
${c(i.choices)} { display: flex; flex-wrap: wrap; gap: 0.25rem; }
${c(i.opt)} { border-radius: 0.25rem; padding: 0.25rem 0.5rem; font-size: 11px; background-color: ${e.surface2}; color: ${e.textMuted}; }
${c(i.optActive)} { background-color: ${e.surface3}; color: ${e.textPrimary}; }
${c(i.grow)} { flex: 1; }
${c(i.left)} { text-align: left; }
${c(i.fixed)} { flex-shrink: 0; }
${c(i.presetRow)} { display: flex; align-items: center; gap: 0.25rem; }
${c(i.presetDelete)} { border-radius: 0.25rem; padding: 0.25rem 0.375rem; font-size: 10px; color: ${e.textMuted}; }
${c(i.warning)} { margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
${c(i.note)} { font-size: 10px; line-height: 1.375; color: ${e.textMuted}; }
${c(i.hint)} { margin-top: 0.5rem; }
${c(i.hintClose)} { margin-top: 0.25rem; }
${c(i.code)} { font-family: ${e.fontCode}; }
${c(i.dest)} { color: ${e.textSecondary}; }
${c(i.link)} { text-decoration-line: underline; }
${c(i.empty)} { font-size: 10px; color: ${e.textMuted}; }
${c(i.toggleRow)} { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 11px; }
${c(i.toggleLabel)} { color: ${e.textSecondary}; }
${c(i.checkbox)} { accent-color: ${e.sliderFill}; }
${c(i.fieldLabel)} { font-size: 11px; color: ${e.textSecondary}; }
${c(i.textInput)} { border-radius: 0.25rem; background-color: ${e.surface2}; padding: 0.25rem 0.5rem; font-size: 11px; color: ${e.textPrimary}; outline-style: none; }
${c(`${i.textInput}:focus`)} { ${t} }
${c(i.presetName)} { width: 6rem; }
${c(i.footer)} { padding: 0.75rem; }
${c(i.summary)} { font-size: 11px; color: ${e.textSecondary}; }
${c(i.actions)} { margin-top: 0.5rem; display: flex; gap: 0.25rem; }
${c(i.exportButton)} { flex: 1; border-radius: 0.25rem; background-color: ${e.sliderFill}; padding: 0.5rem 0.75rem; font-size: 0.75rem; line-height: calc(1 / 0.75); font-weight: 500; color: ${e.white}; }
${c(`${i.exportButton}:disabled`)} { cursor: not-allowed; opacity: 0.4; }
${c(i.presetForm)} { display: flex; gap: 0.25rem; }
${c(i.save)} { border-radius: 0.25rem; background-color: ${e.surface3}; padding: 0.25rem 0.5rem; font-size: 11px; color: ${e.textPrimary}; }
${c(`${i.save}:disabled`)} { opacity: 0.4; }
${c(i.saveOpen)} { border-radius: 0.25rem; background-color: ${e.surface2}; padding: 0.25rem 0.5rem; font-size: 11px; color: ${e.textMuted}; }
${c(i.status)} { font-size: 11px; color: ${e.textSecondary}; }
${c(i.statusShown)} { margin-top: 0.75rem; }
${c(i.failures)} { margin-top: 0.25rem; font-size: 11px; color: ${e.textSecondary}; }
${c(i.failure)} { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
${c(i.reveal)} { margin-top: 0.5rem; width: 100%; border-radius: 0.25rem; background-color: ${e.surface2}; padding: 0.375rem 0.75rem; font-size: 11px; color: ${e.textSecondary}; }
@media (hover: hover) {
  ${c(`${i.opt}:hover`)}, ${c(`${i.presetDelete}:hover`)}, ${c(`${i.link}:hover`)}, ${c(`${i.saveOpen}:hover`)} { color: ${e.textPrimary}; }
  ${c(`${i.exportButton}:hover`)}, ${c(`${i.save}:hover`)} { background-color: ${e.surface4}; }
  ${c(`${i.reveal}:hover`)} { background-color: ${e.surface3}; color: ${e.textPrimary}; }
}
${o.map((e) => `html.sl-larger-text .${e}`).join(", ")} { font-size: 12px !important; }
${s.map((e) => `html.sl-larger-text .${e}`).join(", ")} { font-size: 13px !important; line-height: 1.45 !important; }
`;
}
//#endregion
//#region src/ExportFailureList.tsx
var u = 10;
function ee({ failures: t }) {
	if (!t || t.length === 0) return null;
	let n = t.length - u;
	return /* @__PURE__ */ e.createElement("ul", { className: i.failures }, t.slice(0, u).map(({ filename: t, reason: n }, r) => /* @__PURE__ */ e.createElement("li", {
		key: `${t}-${r}`,
		className: i.failure,
		title: `${t}: ${n}`
	}, t, ": ", n)), n > 0 && /* @__PURE__ */ e.createElement("li", null, "and ", n, " more."));
}
//#endregion
//#region src/export-status.ts
function te(e) {
	let t = `${e.exported} photo${e.exported === 1 ? "" : "s"}`, n = e.exported === 0 ? "before exporting any photos" : `after exporting ${t}`, r;
	return r = e.stopped ? `Stopped: ${e.stopped}, ${n}.` : e.cancelled ? `Cancelled ${n}.` : e.failed.length === 0 ? `Exported ${t}.` : `Exported ${e.exported}; ${e.failed.length} could not be exported.`, e.degradedTo8Bit > 0 && (r += ` ${e.degradedTo8Bit} exported as 8-bit (device can't render 16-bit).`), e.reducedPrecision > 0 && (r += ` ${e.reducedPrecision} exported at reduced 16-bit precision (device can't render full precision).`), e.withoutStages && (r += ` ${e.withoutStages} exported without an extension's effect (its shader failed to build).`), e.zipFellBack && (r += " ZIP exceeded 4 GiB; delivered as individual files."), r;
}
//#endregion
//#region src/ExportPanel.tsx
var ne = [
	{
		value: "image/jpeg",
		label: "JPEG"
	},
	{
		value: "image/png",
		label: "PNG"
	},
	{
		value: "image/webp",
		label: "WebP"
	},
	{
		value: "image/tiff",
		label: "TIFF"
	}
], re = [{
	value: 8,
	label: "8-bit"
}, {
	value: 16,
	label: "16-bit"
}], d = "safelight-export";
function f({ field: n, value: r, onChange: o }) {
	let { Slider: s } = t.components;
	if (n.type === "boolean") {
		let t = typeof r == "boolean" ? r : n.default;
		return /* @__PURE__ */ e.createElement("label", { className: i.toggleRow }, /* @__PURE__ */ e.createElement("span", { className: i.toggleLabel }, n.label), /* @__PURE__ */ e.createElement("input", {
			type: "checkbox",
			checked: t,
			onChange: (e) => o(e.target.checked),
			className: i.checkbox
		}));
	}
	if (n.type === "number") {
		let t = typeof r == "number" ? r : n.default;
		return /* @__PURE__ */ e.createElement(s, {
			label: n.label,
			value: t,
			min: n.min ?? 0,
			max: n.max ?? 100,
			step: n.step,
			defaultValue: n.default,
			onChange: (e) => o(e)
		});
	}
	if (n.type === "string") {
		let t = typeof r == "string" ? r : n.default;
		return /* @__PURE__ */ e.createElement("label", { className: i.stack }, /* @__PURE__ */ e.createElement("span", { className: i.fieldLabel }, n.label), /* @__PURE__ */ e.createElement("input", {
			type: "text",
			value: t,
			placeholder: n.placeholder,
			onChange: (e) => o(e.target.value),
			className: i.textInput
		}));
	}
	if (n.type === "select") {
		let t = typeof r == "string" ? r : n.default;
		return /* @__PURE__ */ e.createElement("div", { className: i.stack }, /* @__PURE__ */ e.createElement("span", { className: i.fieldLabel }, n.label), /* @__PURE__ */ e.createElement("div", { className: i.choices }, n.options.map((n) => /* @__PURE__ */ e.createElement("button", {
			key: n.value,
			onClick: () => o(n.value),
			className: a(t === n.value)
		}, n.label))));
	}
	return null;
}
function p() {
	let { Panel: n, Slider: r, ResolutionControl: o } = t.components, { Button: s } = t.ui, { useCatalogStore: c, useSettings: l } = t.stores, u = c((e) => e.photos), p = c((e) => e.selectedIds), m = c((e) => e.activePhotoId), h = () => l.getState(), [g, _] = e.useState(() => h().exportFormat), [v, ie] = e.useState(() => h().exportQuality), [y, ae] = e.useState(() => h().exportLongEdge), [b, x] = e.useState(() => h().exportTiffBitDepth), [S, C] = e.useState(() => h().exportPngBitDepth), [w, oe] = e.useState(() => h().exportColorSpace), T = l((e) => e.exportIncludeMetadata), E = l((e) => e.exportIncludeLocation), [D, O] = e.useState("folder"), [k, A] = e.useState(null), [j, se] = e.useState(!1), M = e.useRef(null), [ce, N] = e.useState(!1), [P, F] = e.useState(null), [I, L] = e.useState(null), [le, R] = e.useState(void 0), [z, B] = e.useState(null), [V, H] = e.useState(0), [U, W] = e.useState(1), G = l((e) => e.exportPresets), [ue, K] = e.useState(!1), [q, de] = e.useState(""), fe = t.registry.use((e) => e.exportProcessors), pe = t.registry.use((e) => e.filenameTemplates), me = e.useMemo(() => Object.values(fe).sort((e, t) => e.order - t.order), [fe]), J = e.useMemo(() => Object.values(pe), [pe]), [he, ge] = e.useState({}), [Y, X] = e.useState();
	e.useEffect(() => {
		Y !== void 0 && !J.some((e) => e.id === Y) && X(void 0);
	}, [J, Y]);
	let _e = (e, t, n) => {
		ge((r) => ({
			...r,
			[e]: {
				...r[e] ?? {},
				[t]: n
			}
		}));
	}, Z = e.useMemo(() => {
		if (p.size > 0) return u.filter((e) => p.has(e.id));
		if (m) {
			let e = u.find((e) => e.id === m);
			return e ? [e] : [];
		}
		return [];
	}, [
		u,
		p,
		m
	]), ve = g === "image/jpeg" || g === "image/webp", Q = g === "image/tiff", ye = Q || g === "image/png", $ = Q ? b : S, be = Q ? x : C, xe = {
		format: g,
		tiffBitDepth: b,
		pngBitDepth: S
	}, Se = t.export.proPhotoAt8Bit({
		...xe,
		colorSpace: w
	});
	e.useEffect(() => {
		Z.length === 1 && (D === "zip" || D === "folder") && O("files");
	}, [Z.length, D]);
	let Ce = (e) => {
		_(e.format), ie(e.quality), ae(e.longEdge), H(e.sharpenAmount), W(e.sharpenRadius), oe(e.colorSpace), e.tiffBitDepth && x(e.tiffBitDepth), e.pngBitDepth && C(e.pngBitDepth);
	}, we = () => {
		let e = q.trim();
		if (!e) return;
		let n = {
			name: e,
			format: g,
			quality: v,
			longEdge: y,
			colorSpace: w,
			sharpenAmount: V,
			sharpenRadius: U,
			tiffBitDepth: b,
			pngBitDepth: S
		}, r = G.filter((t) => t.name !== e);
		t.appSettings.update({ exportPresets: [...r, n] }), K(!1), de("");
	}, Te = (e) => {
		t.appSettings.update({ exportPresets: G.filter((t) => t.name !== e) });
	}, Ee = async () => {
		let e = await t.project.pickDirectory(d);
		e && (A(e), O("folder"));
	}, De = async () => {
		if (j || Z.length === 0) return;
		let e = k;
		if (D === "folder" && !e) {
			if (e = await t.project.pickDirectory(d), !e) return;
			A(e);
		}
		let n = new AbortController();
		M.current = n, se(!0), N(!1), L(null), R(void 0), B(null), F({
			done: 0,
			total: Z.length
		});
		let r = {
			...xe,
			quality: v / 100,
			longEdge: y,
			bundle: D === "zip",
			delivery: D,
			colorSpace: w,
			processorSettings: he,
			filenameTemplateId: Y,
			sharpenAmount: V,
			sharpenRadius: U,
			includeMetadata: T,
			includeLocation: E
		};
		try {
			let i = await t.export.exportPhotos(Z, r, (e) => F({
				done: e.done,
				total: e.total
			}), e ?? void 0, { signal: n.signal });
			if (L(te(i)), R(i.failures), D === "folder" && i.exported > 0) {
				let n = e ? t.project.pathOf(e) : null;
				n && B(n);
			}
		} catch (e) {
			L(`Export failed: ${e instanceof Error ? e.message : String(e)}`);
		} finally {
			M.current = null, se(!1), N(!1), F(null);
		}
	}, Oe = () => {
		M.current?.abort(), N(!0);
	}, ke = Y === void 0 ? void 0 : J.find((e) => e.id === Y);
	return /* @__PURE__ */ e.createElement("div", { className: i.root }, G.length > 0 && /* @__PURE__ */ e.createElement(n, { title: "Preset" }, /* @__PURE__ */ e.createElement("div", { className: i.stack }, G.map((t) => /* @__PURE__ */ e.createElement("div", {
		key: t.name,
		className: i.presetRow
	}, /* @__PURE__ */ e.createElement("button", {
		onClick: () => Ce(t),
		className: `${i.grow} ${i.left} ${a(!1)}`
	}, t.name), /* @__PURE__ */ e.createElement("button", {
		onClick: () => Te(t.name),
		className: i.presetDelete,
		title: "Delete preset"
	}, "×"))))), /* @__PURE__ */ e.createElement(n, { title: "Format" }, /* @__PURE__ */ e.createElement("div", { className: i.segments }, ne.map((t) => /* @__PURE__ */ e.createElement("button", {
		key: t.value,
		onClick: () => _(t.value),
		"aria-pressed": g === t.value,
		className: `${i.grow} ${a(g === t.value)}`
	}, t.label))), Se && /* @__PURE__ */ e.createElement("div", { className: i.warning }, /* @__PURE__ */ e.createElement("p", { className: `${i.grow} ${i.note}` }, "ProPhoto at 8 bits can band in smooth gradients."), /* @__PURE__ */ e.createElement("button", {
		onClick: () => {
			_("image/tiff"), x(16);
		},
		className: `${i.fixed} ${a(!1)}`
	}, "Use 16-bit TIFF"))), ye && /* @__PURE__ */ e.createElement(n, { title: "Bit Depth" }, /* @__PURE__ */ e.createElement("div", { className: i.segments }, re.map((t) => /* @__PURE__ */ e.createElement("button", {
		key: t.value,
		onClick: () => be(t.value),
		"aria-pressed": $ === t.value,
		className: `${i.grow} ${a($ === t.value)}`
	}, t.label))), /* @__PURE__ */ e.createElement("p", { className: `${i.note} ${i.hint}` }, $ === 16 ? "16-bit keeps the full editing precision for further work. Output sharpening is applied at 8-bit only." : "8-bit is smaller and universally compatible.")), ve && /* @__PURE__ */ e.createElement(n, { title: "Quality" }, /* @__PURE__ */ e.createElement(r, {
		label: "",
		value: v,
		min: 1,
		max: 100,
		defaultValue: 90,
		onChange: ie
	})), /* @__PURE__ */ e.createElement(n, { title: "Resolution" }, /* @__PURE__ */ e.createElement(o, {
		variant: "panel",
		value: y,
		onChange: ae
	}), /* @__PURE__ */ e.createElement("p", { className: `${i.note} ${i.hint}` }, "Long edge. Output is capped at the largest decodable size.")), /* @__PURE__ */ e.createElement(n, {
		title: "Output Sharpening",
		defaultOpen: !1
	}, /* @__PURE__ */ e.createElement(r, {
		label: "Amount",
		value: V,
		min: 0,
		max: 150,
		step: 1,
		defaultValue: 0,
		onChange: H
	}), /* @__PURE__ */ e.createElement(r, {
		label: "Radius",
		value: U,
		min: .3,
		max: 3,
		step: .1,
		defaultValue: 1,
		onChange: W
	}), V === 0 && /* @__PURE__ */ e.createElement("p", { className: `${i.note} ${i.hintClose}` }, "Off. Increase amount to sharpen after resize.")), /* @__PURE__ */ e.createElement(n, { title: "Delivery" }, /* @__PURE__ */ e.createElement("div", { className: i.segments }, Z.length !== 1 && /* @__PURE__ */ e.createElement("button", {
		onClick: () => O("zip"),
		className: `${i.grow} ${a(D === "zip")}`
	}, "ZIP"), /* @__PURE__ */ e.createElement("button", {
		onClick: () => O("files"),
		className: `${i.grow} ${a(D === "files")}`
	}, "Files"), Z.length !== 1 && /* @__PURE__ */ e.createElement("button", {
		onClick: () => O("folder"),
		className: `${i.grow} ${a(D === "folder")}`
	}, "Folder")), D === "folder" ? /* @__PURE__ */ e.createElement("p", { className: `${i.note} ${i.hint}` }, k ? /* @__PURE__ */ e.createElement(e.Fragment, null, "Saving to ", /* @__PURE__ */ e.createElement("span", { className: i.dest }, k.name), ".", " ", /* @__PURE__ */ e.createElement("button", {
		onClick: () => void Ee(),
		className: i.link
	}, "Change...")) : "A folder picker will open on export.") : D === "zip" ? /* @__PURE__ */ e.createElement("p", { className: `${i.note} ${i.hint}` }, "All photos in a single ZIP download.") : /* @__PURE__ */ e.createElement("p", { className: `${i.note} ${i.hint}` }, "One download prompt per photo.")), J.length > 0 && /* @__PURE__ */ e.createElement(n, {
		title: "Filename",
		defaultOpen: !1
	}, /* @__PURE__ */ e.createElement("div", { className: i.stack }, /* @__PURE__ */ e.createElement("button", {
		onClick: () => X(void 0),
		className: `${i.left} ${a(Y === void 0)}`
	}, "Default"), J.map((t) => /* @__PURE__ */ e.createElement("button", {
		key: t.id,
		onClick: () => X(t.id),
		className: `${i.left} ${a(Y === t.id)}`
	}, t.label))), ke && /* @__PURE__ */ e.createElement("p", { className: `${i.note} ${i.hint} ${i.code}` }, ke.template)), me.map((t) => {
		let r = t.settings ?? [], a = he[t.id] ?? {}, o = (e) => e.key === "enabled" && e.type === "boolean", s = r.find(o), c = r.filter((e) => !o(e));
		return /* @__PURE__ */ e.createElement(n, {
			key: t.id,
			title: t.label,
			defaultOpen: !1
		}, s && /* @__PURE__ */ e.createElement(f, {
			key: "enabled",
			field: s,
			value: a.enabled,
			onChange: (e) => _e(t.id, "enabled", e)
		}), c.map((n) => /* @__PURE__ */ e.createElement(f, {
			key: n.key,
			field: n,
			value: a[n.key],
			onChange: (e) => _e(t.id, n.key, e)
		})), r.length === 0 && /* @__PURE__ */ e.createElement("p", { className: i.empty }, "No settings."));
	}), /* @__PURE__ */ e.createElement("div", { className: i.footer }, /* @__PURE__ */ e.createElement("p", { className: i.summary }, Z.length === 0 ? "Select one or more photos in the Library to export." : `${Z.length} photo${Z.length === 1 ? "" : "s"} ready as ${g.split("/")[1].toUpperCase()}.`), /* @__PURE__ */ e.createElement("div", { className: i.actions }, /* @__PURE__ */ e.createElement("button", {
		onClick: () => void De(),
		disabled: j || Z.length === 0,
		className: i.exportButton
	}, j && P ? `Exporting ${P.done}/${P.total}...` : Z.length > 0 ? `Export ${Z.length}` : "Export"), j && /* @__PURE__ */ e.createElement(s, {
		size: "sm",
		onClick: Oe,
		disabled: ce
	}, "Cancel"), ue ? /* @__PURE__ */ e.createElement("form", {
		className: i.presetForm,
		onSubmit: (e) => {
			e.preventDefault(), we();
		}
	}, /* @__PURE__ */ e.createElement("input", {
		type: "text",
		value: q,
		onChange: (e) => de(e.target.value),
		placeholder: "Preset name",
		"aria-label": "Export preset name",
		autoFocus: !0,
		className: `${i.textInput} ${i.presetName}`,
		onKeyDown: (e) => {
			e.key === "Escape" && K(!1);
		}
	}), /* @__PURE__ */ e.createElement("button", {
		type: "submit",
		disabled: !q.trim(),
		className: i.save
	}, "Save")) : /* @__PURE__ */ e.createElement("button", {
		onClick: () => K(!0),
		className: i.saveOpen,
		title: "Save current settings as a preset"
	}, "Save...")), /* @__PURE__ */ e.createElement("p", {
		role: "status",
		"aria-live": "polite",
		className: I ? `${i.status} ${i.statusShown}` : i.status
	}, I), /* @__PURE__ */ e.createElement(ee, { failures: le }), z && /* @__PURE__ */ e.createElement("button", {
		onClick: () => void t.project.reveal(z),
		className: i.reveal
	}, "Open Folder")), /* @__PURE__ */ e.createElement(n, {
		title: "Privacy",
		defaultOpen: !1
	}, /* @__PURE__ */ e.createElement("p", { className: i.note }, T ? E ? "Camera, exposure and GPS location tags are copied into exported files, as set in Preferences > Export." : "Camera and exposure tags are copied into exported files; GPS location is stripped. Configured in Preferences > Export." : "Exports carry no EXIF or location metadata. Metadata can be enabled in Preferences > Export.", " ", "Everything is rendered locally; nothing leaves your device.")));
}
//#endregion
//#region src/index.tsx
var m = "core.export", h = "safelight.export.styles";
function g(e) {
	n(e), e.registerStylesheet({
		id: h,
		css: l(e.ui.tokens)
	}), e.registerPanel({
		id: m,
		title: "Export",
		component: p,
		defaultDock: {
			module: "library",
			direction: "right",
			order: 1,
			width: 280
		}
	});
}
//#endregion
export { m as PANEL_ID, h as STYLESHEET_ID, g as activate };

//# sourceMappingURL=index.js.map