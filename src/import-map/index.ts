import {
  ConfigEnv,
  HtmlTagDescriptor,
  IndexHtmlTransformResult,
  ResolvedConfig,
  UserConfig,
  Plugin as VitePlugin,
} from "vite";
import { Module } from "./types";

export interface PluginImportMapParam {
  /**
   * modules
   */
  modules: Module[];
  /**
   * use cdn css when serve
   *
   * default is true
   */
  cssServe?: boolean;
}

export class PluginImportMap implements VitePlugin {
  /**
   * vite plugin name
   */
  public readonly name = "vite-plugin-import-map";
  /**
   * vite plugin version
   */
  public readonly version = "0.0.1";
  /**
   * if is build
   */
  public isBuild = false;
  /**
   * use cdn css when serve
   */
  public cssServe = true;
  /**
   * all modules
   */
  public moduleMap: Record<string, string> = {};
  /**
   * all css
   */
  public cssList: string[] = [];

  constructor(param: PluginImportMapParam) {
    const { modules, cssServe = true } = param;
    modules.forEach((m) => {
      const { name, path, css } = m;
      if (path) this.moduleMap[name] = path;
      if (css instanceof Array) this.cssList = this.cssList.concat(css);
      else if (css) this.cssList.push(css);
    });
    this.cssServe = cssServe;
  }

  /**
   * vite plugin config
   */
  public config = (cfg: UserConfig, env: ConfigEnv): UserConfig | null => {
    // set local
    const { command } = env;
    this.isBuild = command === "build";
    // change config when build
    if (!this.isBuild) return null;
    return {
      build: {
        rollupOptions: {
          external: Object.keys(this.moduleMap),
        },
      },
    };
  };

  /**
   * vite plugin config resloved
   */
  public configResolved = (cfg: ResolvedConfig) => {
    const { command } = cfg;
    this.isBuild = command === "build";
  };

  /**
   * vite plugin trancsfor index html
   */
  public transformIndexHtml = (html: string): IndexHtmlTransformResult => {
    // build style all the time
    const styleTags: HtmlTagDescriptor[] =
      this.isBuild || this.cssServe
        ? this.cssList.map((c) => {
            return {
              tag: "link",
              attrs: {
                href: c,
                rel: "stylesheet",
              },
            };
          })
        : [];
    // build script when build
    const scriptTags: HtmlTagDescriptor[] = this.isBuild
      ? [
          {
            tag: "script",
            attrs: { type: "importmap" },
            children: JSON.stringify({ imports: this.moduleMap }, undefined, 2),
          },
        ]
      : [];
    return {
      html,
      tags: styleTags.concat(scriptTags),
    };
  };
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
 * import { importMap } from "vite-plugins";
 *
 * // https://vitejs.dev/config/
 * export default defineConfig({
 *   plugins: [
 *     vue(),
 *     importMap({
 *       modules: [
 *         {
 *           name: "element-plus",
 *           path: "https://cdn.jsdelivr.net/npm/element-plus@2.3.8/dist/index.full.mjs",
 *           css: [
 *             "https://cdn.jsdelivr.net/npm/element-plus@2.3.1/dist/index.min.css",
 *             "https://cdn.jsdelivr.net/npm/element-plus@2.3.1/theme-chalk/dark/css-vars.css",
 *           ],
 *         },
 *         {
 *           name: "@element-plus/icons-vue",
 *           path: "https://cdn.jsdelivr.net/npm/@element-plus/icons-vue@2.1.0/dist/index.min.js",
 *         },
 *         {
 *           name: "vue",
 *           path: "https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.esm-browser.js",
 *         },
 *         {
 *           name: "vue-router",
 *           path: "https://cdn.jsdelivr.net/npm/vue-router@4.2.4/dist/vue-router.esm-browser.js",
 *         },
 *         {
 *           name: "lodash-es",
 *           path: "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm",
 *         },
 *         {
 *           name: "dayjs",
 *           path: "https://cdn.jsdelivr.net/npm/dayjs@1.11.8/+esm",
 *         },
 *         {
 *           name: "@vue/devtools-api",
 *           path: "https://cdn.jsdelivr.net/npm/@vue/devtools-api@6.5.0/+esm",
 *         },
 *       ],
 *     }),
 *   ],
 * });
 * ```
 */
export function importMap(param: PluginImportMapParam) {
  return new PluginImportMap(param);
}

export * from "./types";
