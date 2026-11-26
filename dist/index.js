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
	grow: `${r}-grow`,
	presetRow: `${r}-preset-row`,
	warning: `${r}-warning`,
	note: `${r}-note`,
	hint: `${r}-hint`,
	dest: `${r}-dest`,
	empty: `${r}-empty`,
	fieldLabel: `${r}-field-label`,
	presetName: `${r}-preset-name`,
	footer: `${r}-footer`,
	summary: `${r}-summary`,
	actions: `${r}-actions`,
	presetForm: `${r}-preset-form`,
	status: `${r}-status`,
	statusShown: `${r}-status-shown`,
	failures: `${r}-failures`,
	failure: `${r}-failure`
}, a = [i.note, i.empty], o = [
	i.fieldLabel,
	i.summary,
	i.status,
	i.failures
], s = (e) => `:where(.${e})`;
function c(e) {
	return `
${s(i.root)} { display: flex; flex-direction: column; }
${s(i.stack)} { display: flex; flex-direction: column; gap: 0.25rem; }
${s(i.grow)} { flex: 1; }
${s(i.presetRow)} { display: flex; align-items: center; gap: 0.25rem; }
${s(i.warning)} { margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
${s(i.note)} { font-size: 10px; line-height: 1.375; color: ${e.textMuted}; }
${s(i.hint)} { margin-top: 0.5rem; }
${s(i.dest)} { color: ${e.textSecondary}; }
${s(i.empty)} { font-size: 10px; color: ${e.textMuted}; }
${s(i.fieldLabel)} { font-size: 11px; color: ${e.textSecondary}; }
${s(i.presetName)} { width: 6rem; }
${s(i.footer)} { padding: 0.75rem; }
${s(i.summary)} { font-size: 11px; color: ${e.textSecondary}; }
${s(i.actions)} { margin-top: 0.5rem; display: flex; gap: 0.25rem; }
${s(i.presetForm)} { display: flex; gap: 0.25rem; }
${s(i.status)} { font-size: 11px; color: ${e.textSecondary}; }
${s(i.statusShown)} { margin-top: 0.75rem; }
${s(i.failures)} { margin-top: 0.25rem; font-size: 11px; color: ${e.textSecondary}; }
${s(i.failure)} { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
${a.map((e) => `html.sl-larger-text .${e}`).join(", ")} { font-size: 12px !important; }
${o.map((e) => `html.sl-larger-text .${e}`).join(", ")} { font-size: 13px !important; line-height: 1.45 !important; }
`;
}
//#endregion
//#region src/ExportFailureList.tsx
var l = 10;
function ee({ failures: t }) {
	if (!t || t.length === 0) return null;
	let n = t.length - l;
	return /* @__PURE__ */ e.createElement("ul", { className: i.failures }, t.slice(0, l).map(({ filename: t, reason: n }, r) => /* @__PURE__ */ e.createElement("li", {
		key: `${t}-${r}`,
		className: i.failure,
		title: `${t}: ${n}`
	}, t, ": ", n)), n > 0 && /* @__PURE__ */ e.createElement("li", null, "and ", n, " more."));
}
//#endregion
//#region src/ExportPanel.tsx
var te = [
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
], ne = [{
	value: "8",
	label: "8-bit",
	title: "8-bit is smaller and universally compatible."
}, {
	value: "16",
	label: "16-bit",
	title: "16-bit keeps the full editing precision for further work. Output sharpening is applied at 8-bit only."
}], re = "safelight-export";
function u({ field: n, value: r, onChange: a }) {
	let { Slider: o } = t.components, { Toggle: s, TextInput: c, SegmentedControl: l } = t.ui;
	if (n.type === "boolean") {
		let t = typeof r == "boolean" ? r : n.default;
		return /* @__PURE__ */ e.createElement(s, {
			label: n.label,
			checked: t,
			onChange: a
		});
	}
	if (n.type === "number") {
		let t = typeof r == "number" ? r : n.default;
		return /* @__PURE__ */ e.createElement(o, {
			label: n.label,
			value: t,
			min: n.min ?? 0,
			max: n.max ?? 100,
			step: n.step,
			defaultValue: n.default,
			onChange: (e) => a(e)
		});
	}
	if (n.type === "string") {
		let t = typeof r == "string" ? r : n.default;
		return /* @__PURE__ */ e.createElement("label", { className: i.stack }, /* @__PURE__ */ e.createElement("span", { className: i.fieldLabel }, n.label), /* @__PURE__ */ e.createElement(c, {
			value: t,
			placeholder: n.placeholder,
			onChange: a
		}));
	}
	if (n.type === "select") {
		let t = typeof r == "string" ? r : n.default;
		return /* @__PURE__ */ e.createElement("div", { className: i.stack }, /* @__PURE__ */ e.createElement("span", { className: i.fieldLabel }, n.label), /* @__PURE__ */ e.createElement(l, {
			size: "sm",
			value: t,
			onChange: a,
			options: n.options
		}));
	}
	return null;
}
function d() {
	let { Panel: n, Slider: r, ResolutionControl: a } = t.components, { Button: o, TextInput: s, SegmentedControl: c } = t.ui, { useSettings: l } = t.stores, d = t.catalog.useTargetPhotos(), f = () => l.getState(), [p, m] = e.useState(() => f().exportFormat), [h, g] = e.useState(() => f().exportQuality), [_, v] = e.useState(() => f().exportLongEdge), [y, b] = e.useState(() => f().exportTiffBitDepth), [x, S] = e.useState(() => f().exportPngBitDepth), [C, ie] = e.useState(() => f().exportColorSpace), w = l((e) => e.exportIncludeMetadata), T = l((e) => e.exportIncludeLocation), [E, D] = e.useState("folder"), [O, k] = e.useState(null), [A, ae] = e.useState(!1), j = e.useRef(null), [oe, M] = e.useState(!1), [N, P] = e.useState(null), [F, I] = e.useState(null), [se, L] = e.useState(void 0), [R, z] = e.useState(null), [B, V] = e.useState(0), [H, U] = e.useState(1), W = l((e) => e.exportPresets), [ce, G] = e.useState(!1), [K, q] = e.useState(""), J = t.registry.use((e) => e.exportProcessors), Y = t.registry.use((e) => e.filenameTemplates), le = e.useMemo(() => Object.values(J).sort((e, t) => e.order - t.order), [J]), X = e.useMemo(() => Object.values(Y), [Y]), [ue, de] = e.useState({}), [Z, Q] = e.useState();
	e.useEffect(() => {
		Z !== void 0 && !X.some((e) => e.id === Z) && Q(void 0);
	}, [X, Z]);
	let fe = (e, t, n) => {
		de((r) => ({
			...r,
			[e]: {
				...r[e] ?? {},
				[t]: n
			}
		}));
	}, pe = p === "image/jpeg" || p === "image/webp", $ = p === "image/tiff", me = $ || p === "image/png", he = $ ? y : x, ge = $ ? b : S, _e = {
		format: p,
		tiffBitDepth: y,
		pngBitDepth: x
	}, ve = t.export.proPhotoAt8Bit({
		..._e,
		colorSpace: C
	});
	e.useEffect(() => {
		d.length === 1 && (E === "zip" || E === "folder") && D("files");
	}, [d.length, E]);
	let ye = (e) => {
		m(e.format), g(e.quality), v(e.longEdge), V(e.sharpenAmount), U(e.sharpenRadius), ie(e.colorSpace), e.tiffBitDepth && b(e.tiffBitDepth), e.pngBitDepth && S(e.pngBitDepth);
	}, be = () => {
		let e = K.trim();
		if (!e) return;
		let n = {
			name: e,
			format: p,
			quality: h,
			longEdge: _,
			colorSpace: C,
			sharpenAmount: B,
			sharpenRadius: H,
			tiffBitDepth: y,
			pngBitDepth: x
		}, r = W.filter((t) => t.name !== e);
		t.appSettings.update({ exportPresets: [...r, n] }), G(!1), q("");
	}, xe = (e) => {
		t.appSettings.update({ exportPresets: W.filter((t) => t.name !== e) });
	}, Se = async () => {
		let e = await t.project.pickDirectory(re);
		e && (k(e), D("folder"));
	}, Ce = async () => {
		if (A || d.length === 0) return;
		let e = O;
		if (E === "folder" && !e) {
			if (e = await t.project.pickDirectory(re), !e) return;
			k(e);
		}
		let n = new AbortController();
		j.current = n, ae(!0), M(!1), I(null), L(void 0), z(null), P({
			done: 0,
			total: d.length
		});
		let r = {
			..._e,
			quality: h / 100,
			longEdge: _,
			bundle: E === "zip",
			delivery: E,
			colorSpace: C,
			processorSettings: ue,
			filenameTemplateId: Z,
			sharpenAmount: B,
			sharpenRadius: H,
			includeMetadata: w,
			includeLocation: T
		};
		try {
			let i = await t.export.exportPhotos(d, r, (e) => P({
				done: e.done,
				total: e.total
			}), e ?? void 0, { signal: n.signal });
			if (I(t.export.describeResult(i)), L(i.failures), E === "folder" && i.exported > 0) {
				let n = e ? t.project.pathOf(e) : null;
				n && z(n);
			}
		} catch (e) {
			I(`Export failed: ${e instanceof Error ? e.message : String(e)}`);
		} finally {
			j.current = null, ae(!1), M(!1), P(null);
		}
	}, we = () => {
		j.current?.abort(), M(!0);
	}, Te = [
		{
			value: "zip",
			label: "ZIP",
			title: "All photos in a single ZIP download."
		},
		{
			value: "files",
			label: "Files",
			title: "One download prompt per photo."
		},
		{
			value: "folder",
			label: "Folder",
			title: "A folder picker opens on export."
		}
	].filter((e) => d.length !== 1 || e.value === "files");
	return /* @__PURE__ */ e.createElement("div", { className: i.root }, W.length > 0 && /* @__PURE__ */ e.createElement(n, { title: "Preset" }, /* @__PURE__ */ e.createElement("div", { className: i.stack }, W.map((t) => /* @__PURE__ */ e.createElement("div", {
		key: t.name,
		className: i.presetRow
	}, /* @__PURE__ */ e.createElement("div", { className: i.grow }, /* @__PURE__ */ e.createElement(o, {
		size: "sm",
		full: !0,
		onClick: () => ye(t)
	}, t.name)), /* @__PURE__ */ e.createElement(o, {
		variant: "ghost",
		size: "sm",
		onClick: () => xe(t.name),
		title: "Delete preset"
	}, "×"))))), /* @__PURE__ */ e.createElement(n, { title: "Format" }, /* @__PURE__ */ e.createElement(c, {
		value: p,
		onChange: (e) => m(te.find((t) => t.value === e)?.value ?? p),
		options: te
	}), ve && /* @__PURE__ */ e.createElement("div", { className: i.warning }, /* @__PURE__ */ e.createElement("p", { className: `${i.grow} ${i.note}` }, "ProPhoto at 8 bits can band in smooth gradients."), /* @__PURE__ */ e.createElement(o, {
		size: "sm",
		onClick: () => {
			m("image/tiff"), b(16);
		}
	}, "Use 16-bit TIFF"))), me && /* @__PURE__ */ e.createElement(n, { title: "Bit Depth" }, /* @__PURE__ */ e.createElement(c, {
		value: String(he),
		onChange: (e) => ge(e === "16" ? 16 : 8),
		options: ne
	})), pe && /* @__PURE__ */ e.createElement(n, { title: "Quality" }, /* @__PURE__ */ e.createElement(r, {
		label: "",
		value: h,
		min: 1,
		max: 100,
		defaultValue: 90,
		onChange: g
	})), /* @__PURE__ */ e.createElement(n, { title: "Resolution" }, /* @__PURE__ */ e.createElement("div", { title: "Long edge. Output is capped at the largest decodable size." }, /* @__PURE__ */ e.createElement(a, {
		variant: "panel",
		value: _,
		onChange: v
	}))), /* @__PURE__ */ e.createElement(n, {
		title: "Output Sharpening",
		defaultOpen: !1
	}, /* @__PURE__ */ e.createElement(r, {
		label: "Amount",
		value: B,
		min: 0,
		max: 150,
		step: 1,
		defaultValue: 0,
		onChange: V
	}), /* @__PURE__ */ e.createElement(r, {
		label: "Radius",
		value: H,
		min: .3,
		max: 3,
		step: .1,
		defaultValue: 1,
		onChange: U
	})), /* @__PURE__ */ e.createElement(n, { title: "Delivery" }, /* @__PURE__ */ e.createElement(c, {
		value: E,
		onChange: (e) => D(Te.find((t) => t.value === e)?.value ?? E),
		options: Te
	}), E === "folder" && O && /* @__PURE__ */ e.createElement("p", { className: `${i.note} ${i.hint}` }, "Saving to ", /* @__PURE__ */ e.createElement("span", { className: i.dest }, O.name), ".", " ", /* @__PURE__ */ e.createElement(o, {
		variant: "ghost",
		size: "sm",
		onClick: () => void Se()
	}, "Change..."))), X.length > 0 && /* @__PURE__ */ e.createElement(n, {
		title: "Filename",
		defaultOpen: !1
	}, /* @__PURE__ */ e.createElement("div", { className: i.stack }, /* @__PURE__ */ e.createElement(o, {
		full: !0,
		active: Z === void 0,
		onClick: () => Q(void 0)
	}, "Default"), X.map((t) => /* @__PURE__ */ e.createElement(o, {
		key: t.id,
		full: !0,
		active: Z === t.id,
		title: t.template,
		onClick: () => Q(t.id)
	}, t.label)))), le.map((t) => {
		let r = t.settings ?? [], a = ue[t.id] ?? {}, o = (e) => e.key === "enabled" && e.type === "boolean", s = r.find(o), c = r.filter((e) => !o(e));
		return /* @__PURE__ */ e.createElement(n, {
			key: t.id,
			title: t.label,
			defaultOpen: !1
		}, s && /* @__PURE__ */ e.createElement(u, {
			key: "enabled",
			field: s,
			value: a.enabled,
			onChange: (e) => fe(t.id, "enabled", e)
		}), c.map((n) => /* @__PURE__ */ e.createElement(u, {
			key: n.key,
			field: n,
			value: a[n.key],
			onChange: (e) => fe(t.id, n.key, e)
		})), r.length === 0 && /* @__PURE__ */ e.createElement("p", { className: i.empty }, "No settings."));
	}), /* @__PURE__ */ e.createElement("div", { className: i.footer }, /* @__PURE__ */ e.createElement("p", { className: i.summary }, d.length === 0 ? "Select one or more photos in the Library to export." : `${d.length} photo${d.length === 1 ? "" : "s"} ready as ${p.split("/")[1].toUpperCase()}.`), /* @__PURE__ */ e.createElement("div", { className: i.actions }, /* @__PURE__ */ e.createElement(o, {
		variant: "primary",
		full: !0,
		onClick: () => void Ce(),
		disabled: A || d.length === 0
	}, A && N ? `Exporting ${N.done}/${N.total}...` : d.length > 0 ? `Export ${d.length}` : "Export"), A && /* @__PURE__ */ e.createElement(o, {
		size: "sm",
		onClick: we,
		disabled: oe
	}, "Cancel"), ce ? /* @__PURE__ */ e.createElement("form", {
		className: i.presetForm,
		onSubmit: (e) => {
			e.preventDefault(), be();
		}
	}, /* @__PURE__ */ e.createElement("div", { className: i.presetName }, /* @__PURE__ */ e.createElement(s, {
		value: K,
		onChange: q,
		placeholder: "Preset name",
		"aria-label": "Export preset name",
		autoFocus: !0,
		onKeyDown: (e) => {
			e.key === "Escape" && G(!1);
		}
	})), /* @__PURE__ */ e.createElement(o, {
		type: "submit",
		size: "sm",
		disabled: !K.trim()
	}, "Save")) : /* @__PURE__ */ e.createElement(o, {
		size: "sm",
		onClick: () => G(!0),
		title: "Save current settings as a preset"
	}, "Save...")), /* @__PURE__ */ e.createElement("p", {
		role: "status",
		"aria-live": "polite",
		className: F ? `${i.status} ${i.statusShown}` : i.status
	}, F), /* @__PURE__ */ e.createElement(ee, { failures: se }), R && /* @__PURE__ */ e.createElement(o, {
		size: "sm",
		full: !0,
		onClick: () => void t.project.reveal(R)
	}, "Open Folder")), /* @__PURE__ */ e.createElement(n, {
		title: "Privacy",
		defaultOpen: !1
	}, /* @__PURE__ */ e.createElement("p", { className: i.note }, w ? T ? "Camera, exposure and GPS location tags are copied into exported files, as set in Preferences > Export." : "Camera and exposure tags are copied into exported files; GPS location is stripped. Configured in Preferences > Export." : "Exports carry no EXIF or location metadata. Metadata can be enabled in Preferences > Export.", " ", "Everything is rendered locally; nothing leaves your device.")));
}
//#endregion
//#region src/index.tsx
var f = "core.export", p = "safelight.export.styles";
function m(e) {
	n(e), e.registerStylesheet({
		id: p,
		css: c(e.ui.tokens)
	}), e.registerPanel({
		id: f,
		title: "Export",
		component: d,
		defaultDock: {
			module: "library",
			direction: "right",
			order: 1,
			width: 280
		}
	});
}
//#endregion
export { f as PANEL_ID, p as STYLESHEET_ID, m as activate };

//# sourceMappingURL=index.js.map