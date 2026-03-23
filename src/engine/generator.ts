import type {
  GeneratedName,
  NameGenerator,
  NamePack,
  NamePart,
  RandomSource,
} from "../domain/types.js";
import { createSeededRng, randomSeed } from "./rng.js";
import { renderName } from "../rendering/renderer.js";
import { validatePack } from "../validation/validator.js";

/**
 * Core name generator.
 *
 * Holds a registry of validated NamePacks keyed by locale.
 * Generation is pure: given the same seed, locale, and style, it always
 * produces the same output — assuming the pack data has not changed.
 */
export class DostoNamer implements NameGenerator {
  private readonly packs: Map<string, NamePack>;

  constructor(packs: NamePack[]) {
    this.packs = new Map();
    for (const pack of packs) {
      const result = validatePack(pack);
      if (!result.valid) {
        const messages = result.errors.map((e) => `  ${e.field}: ${e.message}`).join("\n");
        throw new Error(`Invalid pack "${(pack as { locale?: string }).locale ?? "unknown"}":\n${messages}`);
      }
      this.packs.set(pack.locale, pack);
    }
  }

  listLocales(): string[] {
    return [...this.packs.keys()].sort();
  }

  listStyles(locale: string): string[] {
    const pack = this.requirePack(locale);
    return Object.keys(pack.styles).sort();
  }

  /**
   * Generate a single name.
   * Creates a fresh RNG from `seed` (or a random one) for isolation —
   * i.e. `generate("en", "feminine", 42)` is always identical regardless
   * of what else has been generated in this session.
   */
  generate(locale: string, style?: string, seed?: number): GeneratedName {
    const resolvedSeed = seed ?? randomSeed();
    const rng = createSeededRng(resolvedSeed);
    return this.generateWithRng(locale, style, resolvedSeed, rng);
  }

  /**
   * Generate multiple names from a single RNG stream.
   * The same seed + count + locale/style always produces the same list.
   */
  generateMany(
    count: number,
    locale: string,
    style?: string,
    seed?: number
  ): GeneratedName[] {
    if (count < 1) return [];
    const resolvedSeed = seed ?? randomSeed();
    const rng = createSeededRng(resolvedSeed);
    const names: GeneratedName[] = [];
    for (let i = 0; i < count; i++) {
      names.push(this.generateWithRng(locale, style, resolvedSeed, rng));
    }
    return names;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private generateWithRng(
    locale: string,
    style: string | undefined,
    seed: number,
    rng: RandomSource
  ): GeneratedName {
    const pack = this.requirePack(locale);
    const styleNames = Object.keys(pack.styles);

    const resolvedStyle =
      style && style !== "any"
        ? style
        : styleNames[rng.nextInt(styleNames.length)];

    const styleDef = pack.styles[resolvedStyle];
    if (!styleDef) {
      throw new Error(
        `Unknown style "${resolvedStyle}" for locale "${locale}". ` +
          `Available: ${styleNames.join(", ")}`
      );
    }

    const parts: NamePart[] = styleDef.composition.map((step) => {
      const pool = pack.pools[step.pool];
      const value = pool[rng.nextInt(pool.length)];
      return {
        type: step.type,
        value,
        position: step.position,
      };
    });

    const display = renderName(parts, styleDef.displayOrder);

    return {
      parts,
      display,
      locale,
      style: resolvedStyle,
      seed,
    };
  }

  private requirePack(locale: string): NamePack {
    const pack = this.packs.get(locale);
    if (!pack) {
      throw new Error(
        `Locale "${locale}" not loaded. Available: ${[...this.packs.keys()].join(", ")}`
      );
    }
    return pack;
  }
}
