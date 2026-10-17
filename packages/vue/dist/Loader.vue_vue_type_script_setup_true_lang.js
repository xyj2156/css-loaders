import { computed as e, createElementBlock as t, createElementVNode as n, defineComponent as r, normalizeClass as i, normalizeStyle as a, openBlock as o } from "vue";
//#region src/Loader.vue?vue&type=script&setup=true&lang.ts
var s = /*@__PURE__*/ r({
	__name: "Loader",
	props: {
		kind: {},
		variant: {},
		size: {},
		color: {},
		duration: {},
		className: {}
	},
	setup(r) {
		let s = r, c = e(() => `__loading-${s.kind}-${s.variant}`), l = e(() => s.className ?? ""), u = e(() => {
			let e = {};
			return s.size && (e["--size"] = s.size), s.color && (e["--color-1"] = s.color), s.duration && (e["--duration"] = s.duration), e;
		});
		return (e, r) => (o(), t("div", {
			class: i(["loader-host", l.value]),
			style: a(u.value)
		}, [n("div", { class: i(c.value) }, null, 2)], 6));
	}
});
//#endregion
export { s as default };
