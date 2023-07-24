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
   * all modules
   */
  public moduleMap: Record<string, string> = {};
  /**
   * all css
   */
  public cssList: string[] = [];

  constructor(param: PluginImportMapParam) {
    const { modules } = param;
    modules.forEach((m) => {
      const { name, path, css } = m;
      if (path) this.moduleMap[name] = path;
      if (css instanceof Array) this.cssList = this.cssList.concat(css);
      else if (css) this.cssList.push(css);
    });
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
    const styleTags: HtmlTagDescriptor[] = this.cssList.map((c) => {
      return {
        tag: "link",
        attrs: {
          href: c,
          rel: "stylesheet",
        },
      };
    });
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
 */
export function importMap(param: PluginImportMapParam) {
  return new PluginImportMap(param);
}
