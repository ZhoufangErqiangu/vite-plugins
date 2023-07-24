/**
 * module
 */
export interface Module {
  /**
   * module name in package.json
   */
  name: string;
  /**
   * path to import script file
   */
  path?: string;
  /**
   * path to import style file
   */
  css?: string | string[];
}
