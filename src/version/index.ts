import { type PluginContext } from "rollup";
import { Plugin as VitePlugin, normalizePath } from "vite";

export interface PluginVersionParam {
  /**
   * set version manually
   */
  version?: string;
  /**
   * version file name, default is version.json
   */
  fileName?: string;
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
    version: "0.0.1",
    /**
     * vite plugin apply
     */
    apply: "build",
    /**
     * vite plugin enforce
     */
    enforce: "post",
    /**
     * roolup build end
     */
    buildEnd(this: PluginContext, err?: Error) {
      if (err) return;
      this.emitFile({
        fileName: normalizePath(param.fileName ?? "version.json"),
        source: JSON.stringify({
          version: param.version ?? process.env.npm_package_version ?? "0.0.0",
        }),
        type: "asset",
      });
    },
  };
}
