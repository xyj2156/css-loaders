import { defineComponent as c, computed as s, openBlock as i, createElementBlock as d, normalizeStyle as u, normalizeClass as t, createElementVNode as m } from "vue";
const p = /* @__PURE__ */ c({
  __name: "Loader",
  props: {
    kind: {},
    variant: {},
    size: {},
    color: {},
    duration: {},
    className: {}
  },
  setup(a) {
    const o = a, n = s(() => `__loading-${o.kind}-${o.variant}`), l = s(() => o.className ?? ""), r = s(() => {
      const e = {};
      return o.size && (e["--size"] = o.size), o.color && (e["--color-1"] = o.color), o.duration && (e["--duration"] = o.duration), e;
    });
    return (e, f) => (i(), d("div", {
      class: t(["loader-host", l.value]),
      style: u(r.value)
    }, [
      m("div", {
        class: t(n.value)
      }, null, 2)
    ], 6));
  }
});
function v(a) {
  a.component("Loader", p);
}
export {
  p as Loader,
  p as default,
  v as install
};
