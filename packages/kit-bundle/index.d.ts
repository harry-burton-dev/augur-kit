/** One way to load the kit: an import map entry for each module, and the stylesheets to link, in order. */
export interface KitBuild {
  /** Bare specifier → file, relative to the bundle's folder. */
  imports: Record<string, string>;
  /** Stylesheets, relative to the bundle's folder, in the order they are linked. */
  styles: string[];
}

/** kit.json: what one kit release serves (ADR 0048). */
export interface Kit extends KitBuild {
  schema: 'augur.kit/v1';
  /** The kit's version: this package's. The bundle is served under `<KIT_URL><version>/`. */
  version: string;
  /** What is in it. */
  packages: Record<string, string>;
  /** React's development build, for a shell's dev server. Its files are under dev/. */
  dev: KitBuild;
  /** Every file → its Subresource Integrity hash (sha384), for the import map's integrity entries. */
  integrity: Record<string, string>;
}

export declare const kitDir: string;
export declare function readKit(): Kit;
