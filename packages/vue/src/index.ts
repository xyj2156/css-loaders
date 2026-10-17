import type { App } from 'vue';
import Loader from './Loader.vue';
import type { LoaderProps } from './Loader.vue';

// 统一组件
export { Loader };
export type { LoaderProps };

// 命名组件（自动生成）
export * from './generated';

export default Loader;

/** 可选：app.use(Loader) 全局注册 */
export function install(app: App) {
  app.component('Loader', Loader);
}
