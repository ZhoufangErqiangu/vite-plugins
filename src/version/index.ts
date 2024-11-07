import {
  HtmlTagDescriptor,
  IndexHtmlTransformResult,
  Plugin as VitePlugin,
} from "vite";

export interface PluginVersionParam {
  /**
   * log prefix, default is `front version`
   */
  logPrefix?: string;
  /**
   * set version manually
   *
   * if not set, will use `process.env.npm_package_version`
   */
  version?: string;
}

/**
 * build a new plugin
 *
 * @example
 *
 * ```typescript
 * // vite.config.ts
 * import vue from "@vitejs/plugin-vue";
 * import { defineConfig } from "vite";
 * import { version } from "vite-plugins";
 *
 * // https://vitejs.dev/config/
 * export default defineConfig({
 *   base: "/dist",
 *   plugins: [
 *     vue(),
 *     version(),
 *   ],
 * });
 * ```
 */
export function version(param: PluginVersionParam = {}): VitePlugin {
  return {
    /**
     * vite plugin name
     */
    name: "vite-plugin-version",
    /**
     * vite plugin version
     */
    version: "0.2.0",
    /**
     * vite plugin apply
     */
    apply: "build",
    /**
     * vite plugin enforce
     */
    enforce: "post",
    /**
     * vite plugin trancsfor index html
     */
    transformIndexHtml(html: string): IndexHtmlTransformResult {
      const { logPrefix = "front version", version } = param;
      const scriptTag: HtmlTagDescriptor = {
        tag: "script",
        attrs: { type: "text/javascript" },
        children: `console.log(${logPrefix},${
          version ?? process.env.npm_package_version
        });`,
      };
      return {
        html: html,
        tags: [scriptTag],
      };
    },
  };
}
