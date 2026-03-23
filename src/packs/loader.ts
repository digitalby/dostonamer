import { readFileSync, readdirSync } from "node:fs";
import { join, extname, basename } from "node:path";
import type { NamePack } from "../domain/types.js";

/**
 * Loads NamePack JSON files from a directory on disk.
 *
 * Each file must be named `<locale>.json` and conform to the NamePack schema.
 * The loader does not validate pack contents — pass loaded packs through
 * `validatePack` (from validation/validator.ts) before use.
 */
export class PackLoader {
  private readonly packsDir: string;

  constructor(packsDir: string) {
    this.packsDir = packsDir;
  }

  /** Load a single pack by locale key (e.g. "en"). */
  loadOne(locale: string): NamePack {
    const filePath = join(this.packsDir, `${locale}.json`);
    let raw: string;
    try {
      raw = readFileSync(filePath, "utf-8");
    } catch {
      throw new Error(
        `Pack file not found for locale "${locale}": ${filePath}`
      );
    }
    return JSON.parse(raw) as NamePack;
  }

  /** Load all *.json packs found in the packs directory. */
  loadAll(): NamePack[] {
    let entries: string[];
    try {
      entries = readdirSync(this.packsDir);
    } catch {
      throw new Error(`Cannot read packs directory: ${this.packsDir}`);
    }

    return entries
      .filter((f) => extname(f) === ".json")
      .map((f) => this.loadOne(basename(f, ".json")));
  }
}
