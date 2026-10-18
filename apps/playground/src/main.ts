import { createApp, h, defineComponent } from 'vue';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { Loader as VueLoader } from '@x-ac/vue-loading';
import { Loader as ReactLoader } from '@x-ac/react-loading';
import cssIndex from '@x-ac/css-loading/style/index.json';
import '@x-ac/css-loading';

// React 组件挂载容器
const ReactMount = defineComponent({
  props: { kind: String, variant: [Number, String] },
  setup(props) {
    return () =>
      h('span', {
        ref: (el) => {
          if (el && !(el as any).__root) {
            const root = createRoot(el as HTMLElement);
            root.render(createElement(ReactLoader, { kind: props.kind, variant: props.variant }));
            (el as any).__root = root;
          }
        },
      });
  },
});

const App = defineComponent({
  setup() {
    const kinds = Object.keys(cssIndex as Record<string, string[]>);
    return () =>
      h('div', [
        // 分类导航
        h('nav', { class: 'nav' },
          kinds.map((k) => h('a', { href: `#${k}` }, k)),
        ),
        // 每个类别
        ...kinds.flatMap((kind) => {
          const classes = cssIndex[kind];
          return [
            h('h2', { key: `h-${kind}`, id: kind }, `${kind} (${classes.length})`),
            h(
              'div',
              { key: `g-${kind}`, class: 'grid' },
              classes.map((cls: string) => {
                const variant = Number(cls.match(/(\d+)$/)![1]);
                return h('div', { key: cls, class: 'cell' }, [
                  h('div', { class: 'stage' }, [
                    h('div', { class: 'item' }, [h('div', { class: cls }), h('span', { class: 'label' }, 'native')]),
                    h('div', { class: 'item' }, [h(VueLoader, { kind, variant }), h('span', { class: 'label' }, 'vue')]),
                    h('div', { class: 'item' }, [h(ReactMount, { kind, variant }), h('span', { class: 'label' }, 'react')]),
                  ]),
                ]);
              }),
            ),
          ];
        }),
      ]);
  },
});

createApp(App).mount('#app');
