import type { GeneratedName, NamePart } from "../domain/types.js";

/**
 * Renders a list of NameParts into a display string.
 *
 * The `displayOrder` array controls the order of parts in the output.
 * For example:
 *   - English: [0, 1]  → "Molly Bennett"
 *   - Surname-first:   [1, 0] → "Bennett Molly"
 *
 * Parts are joined by a single space. Future locales may extend this
 * function to handle particles, zero-width joiners, or other separators.
 */
export function renderName(parts: NamePart[], displayOrder: number[]): string {
  const byPosition = new Map<number, NamePart>();
  for (const part of parts) {
    byPosition.set(part.position, part);
  }

  return displayOrder
    .map((pos) => {
      const part = byPosition.get(pos);
      if (!part) {
        throw new Error(`Rendering error: no part found at position ${pos}`);
      }
      return part.value;
    })
    .join(" ");
}

/**
 * Returns a plain-text summary of a GeneratedName suitable for terminal output.
 */
export function formatPlain(name: GeneratedName): string {
  return name.display;
}

/**
 * Returns a JSON-serialisable representation of a GeneratedName.
 */
export function formatJson(name: GeneratedName): Record<string, unknown> {
  return {
    display: name.display,
    locale: name.locale,
    style: name.style,
    seed: name.seed,
    parts: name.parts.map((p) => ({
      type: p.type,
      value: p.value,
      position: p.position,
    })),
  };
}
