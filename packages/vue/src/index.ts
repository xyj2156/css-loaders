import type { App } from 'vue';
import Loader from './Loader.vue';

export { Loader };
export type { LoaderProps } from './Loader.vue';
export default Loader;

/** 可选：app.use(Loader) 全局注册 */
export function install(app: App) {
  app.component('Loader', Loader);
}
