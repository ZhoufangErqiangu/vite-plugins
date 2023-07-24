import { Module } from "./types";
import {
  Plugin as VitePlugin,
  UserConfig,
  ConfigEnv,
  IndexHtmlTransformResult,
  HtmlTagDescriptor,
} from "vite";

export interface PluginImportMapParam {
  /**
   * modules
   */
  modules: Module[];
}

export class PluginImportMap implements VitePlugin {
  /**
   * work path
   *
   * use vite root
   *
   * default is process.cwd()
   */
  public workPath!: string;
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
   * vite plugin name
   */
  public name = "vite-plugin-import-map";
  /**
   * vite plugin config
   */
  public config = (cfg: UserConfig, env: ConfigEnv): UserConfig | null => {
    // set local
    const { root } = cfg;
    this.workPath = root ?? process.cwd();
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
   * vite plugin trancsfor html
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
            children: JSON.stringify({
              imports: this.moduleMap,
            }),
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
