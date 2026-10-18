import { createApp, h, defineComponent } from 'vue';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { Loader as VueLoader } from '@x-ac/vue-loading';
import { Loader as ReactLoader } from '@x-ac/react-loading';
// css 包的 style/* exports 映射到 src/optimizes/*
import cssIndex from '@x-ac/css-loading/style/index.json';
// 全量 css 预览用（playground 里不需要按需）
import '@x-ac/css-loading';

// 一个 Vue 包装组件：把 React 组件挂进来
const ReactMount = defineComponent({
  props: {
    kind: String,
    variant: [Number, String],
  },
  setup(props) {
    return () =>
      h('span', {
        ref: (el) => {
          if (el && !(el as any).__react_root) {
            const root = createRoot(el as HTMLElement);
            root.render(createElement(ReactLoader, { kind: props.kind, variant: props.variant }));
            (el as any).__react_root = root;
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
        ...kinds.flatMap((kind) => {
          const classes = cssIndex[kind];
          return [
            h('h2', { key: `h-${kind}` }, kind),
            h(
              'div',
              { key: `g-${kind}`, class: 'grid' },
              classes.map((cls: string) => {
                const variant = cls.match(/(\d+)$/)![1];
                return h('div', { key: cls, class: 'cell' }, [
                  h('div', { key: 'native' }, [
                    h('div', { class: cls }),
                    h('div', { class: 'label' }, 'native'),
                  ]),
                  h('div', { key: 'vue' }, [
                    h(VueLoader, { kind, variant: Number(variant) }),
                    h('div', { class: 'label' }, 'vue'),
                  ]),
                  h('div', { key: 'react' }, [
                    h(ReactMount, { kind, variant: Number(variant) }),
                    h('div', { class: 'label' }, 'react'),
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
