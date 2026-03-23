/**
 * Core domain types for dostonamer.
 *
 * These interfaces are intentionally locale-agnostic. They make no assumptions
 * about the number of name parts, their order, or the presence of a surname.
 * This allows future packs for Japanese (surname-first), Icelandic (patronymic),
 * Indonesian (single-name), Arabic (multi-part), etc.
 */

/** The semantic role of a name part. Extensible via string literals. */
export type NamePartType =
  | "given"
  | "surname"
  | "patronymic"
  | "single"
  | "particle"
  | "honorific"
  | "clan"
  | string;

/** One component of a generated name. */
export interface NamePart {
  /** Semantic role of this part (given, surname, patronymic, …). */
  type: NamePartType;
  /** The actual string value, e.g. "Molly" or "Кондратьев". */
  value: string;
  /**
   * Zero-based index describing where this part sits in the composition array.
   * Rendering uses `displayOrder` to determine the final output order.
   */
  position: number;
  /** Optional per-part metadata for future linguistic features. */
  metadata?: Record<string, unknown>;
}

/** A fully-generated name with all context needed for display and reproducibility. */
export interface GeneratedName {
  parts: NamePart[];
  /** Pre-rendered display string (e.g. "Molly Bennett"). */
  display: string;
  /** BCP-47-style locale identifier, e.g. "en", "ru". */
  locale: string;
  /** The style used (e.g. "feminine", "masculine", "neutral"). */
  style: string;
  /** The seed used for this name, enabling reproducibility. */
  seed: number;
  /** Optional extra data attached by the pack or caller. */
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Pack schema types (what lives in the JSON files under /packs/)
// ---------------------------------------------------------------------------

/** One step in a style's composition recipe. */
export interface CompositionStep {
  /** Semantic type of this part. */
  type: NamePartType;
  /**
   * Key into the pack's `pools` map.
   * The generator will pick one value at random from this pool.
   */
  pool: string;
  /** Zero-based position index referenced by `displayOrder`. */
  position: number;
}

/** A named style within a locale pack (e.g. "masculine", "feminine"). */
export interface StyleDefinition {
  /** Human-readable description shown by `--list`. */
  description?: string;
  /**
   * Ordered list of parts to compose. Each step picks one value from a pool.
   * `position` values must be unique and map to indices in `displayOrder`.
   */
  composition: CompositionStep[];
  /**
   * Order in which positions are joined for display.
   * Example: [0, 1] means position-0 then position-1.
   * For surname-first: [1, 0].
   */
  displayOrder: number[];
}

/** A complete locale name pack as stored in a JSON file. */
export interface NamePack {
  /** BCP-47-style locale identifier. */
  locale: string;
  /** Semver version string for schema evolution. */
  version: string;
  /** Named styles available in this pack. */
  styles: Record<string, StyleDefinition>;
  /** Named word lists that styles reference by key. */
  pools: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Engine interfaces
// ---------------------------------------------------------------------------

/** Abstraction over a (possibly seeded) random number source. */
export interface RandomSource {
  /** Returns a float in [0, 1). */
  next(): number;
  /** Returns an integer in [0, max). */
  nextInt(max: number): number;
}

/** Public interface for the name generator. */
export interface NameGenerator {
  /**
   * Generate a single name.
   * @param locale  Locale key, e.g. "en" or "ru".
   * @param style   Optional style within the locale. If omitted, one is chosen at random.
   * @param seed    Optional integer seed for reproducibility.
   */
  generate(locale: string, style?: string, seed?: number): GeneratedName;

  /**
   * Generate multiple names using a single RNG stream seeded from `seed`.
   * The same seed + count + locale/style will always produce the same list.
   */
  generateMany(
    count: number,
    locale: string,
    style?: string,
    seed?: number
  ): GeneratedName[];

  /** Returns keys of all loaded locales. */
  listLocales(): string[];

  /** Returns available style names for a given locale. */
  listStyles(locale: string): string[];
}
