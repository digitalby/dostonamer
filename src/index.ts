/**
 * dostonamer — public library API.
 *
 * Typical usage:
 *
 * ```ts
 * import { createNamer, PackLoader } from "dostonamer";
 * import { join } from "node:path";
 *
 * const loader = new PackLoader(join(import.meta.dirname, "../packs"));
 * const namer = createNamer(loader.loadAll());
 *
 * console.log(namer.generate("en").display);
 * console.log(namer.generate("ru", "feminine", 42).display);
 * ```
 */

export { DostoNamer } from "./engine/generator.js";
export { PackLoader } from "./packs/loader.js";
export { validatePack } from "./validation/validator.js";
export { renderName, formatPlain, formatJson } from "./rendering/renderer.js";
export { createSeededRng, randomSeed } from "./engine/rng.js";

export type {
  GeneratedName,
  NameGenerator,
  NamePack,
  NamePart,
  NamePartType,
  RandomSource,
  StyleDefinition,
  CompositionStep,
} from "./domain/types.js";

export type { ValidationResult, ValidationError } from "./validation/validator.js";

import { DostoNamer } from "./engine/generator.js";
import type { NamePack } from "./domain/types.js";

/**
 * Convenience factory: create a ready-to-use namer from a list of packs.
 */
export function createNamer(packs: NamePack[]): DostoNamer {
  return new DostoNamer(packs);
}
