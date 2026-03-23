import type { NamePack, StyleDefinition } from "../domain/types.js";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const ALLOWED_PART_TYPES = new Set([
  "given",
  "surname",
  "patronymic",
  "single",
  "particle",
  "honorific",
  "clan",
]);

/**
 * Validates a NamePack for structural correctness.
 *
 * Catches: missing required fields, empty pools, unknown pool references,
 * mismatched displayOrder, duplicate pool entries, and unsupported part types.
 */
export function validatePack(pack: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof pack !== "object" || pack === null) {
    return { valid: false, errors: [{ field: "pack", message: "Must be an object" }] };
  }

  const p = pack as Record<string, unknown>;

  // Top-level required fields
  if (typeof p["locale"] !== "string" || p["locale"].trim() === "") {
    errors.push({ field: "locale", message: "Must be a non-empty string" });
  }
  if (typeof p["version"] !== "string" || p["version"].trim() === "") {
    errors.push({ field: "version", message: "Must be a non-empty string" });
  }

  // pools
  if (typeof p["pools"] !== "object" || p["pools"] === null || Array.isArray(p["pools"])) {
    errors.push({ field: "pools", message: "Must be an object" });
  } else {
    const pools = p["pools"] as Record<string, unknown>;
    for (const [key, value] of Object.entries(pools)) {
      if (!Array.isArray(value)) {
        errors.push({ field: `pools.${key}`, message: "Must be an array" });
        continue;
      }
      if (value.length === 0) {
        errors.push({ field: `pools.${key}`, message: "Must not be empty" });
      }
      const seen = new Set<string>();
      for (const entry of value) {
        if (typeof entry !== "string") {
          errors.push({ field: `pools.${key}`, message: "All entries must be strings" });
          break;
        }
        if (seen.has(entry)) {
          errors.push({ field: `pools.${key}`, message: `Duplicate entry: "${entry}"` });
        }
        seen.add(entry);
      }
    }
  }

  // styles
  if (typeof p["styles"] !== "object" || p["styles"] === null || Array.isArray(p["styles"])) {
    errors.push({ field: "styles", message: "Must be an object" });
  } else {
    const styles = p["styles"] as Record<string, unknown>;
    if (Object.keys(styles).length === 0) {
      errors.push({ field: "styles", message: "Must define at least one style" });
    }
    const pools = (p["pools"] ?? {}) as Record<string, unknown>;

    for (const [styleName, styleDef] of Object.entries(styles)) {
      validateStyle(styleName, styleDef, pools, errors);
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateStyle(
  styleName: string,
  styleDef: unknown,
  pools: Record<string, unknown>,
  errors: ValidationError[]
): void {
  const prefix = `styles.${styleName}`;

  if (typeof styleDef !== "object" || styleDef === null) {
    errors.push({ field: prefix, message: "Must be an object" });
    return;
  }

  const s = styleDef as Record<string, unknown>;

  // composition
  if (!Array.isArray(s["composition"]) || s["composition"].length === 0) {
    errors.push({ field: `${prefix}.composition`, message: "Must be a non-empty array" });
  } else {
    const positions = new Set<number>();
    for (let i = 0; i < s["composition"].length; i++) {
      const step = s["composition"][i] as Record<string, unknown>;
      if (typeof step["type"] !== "string") {
        errors.push({ field: `${prefix}.composition[${i}].type`, message: "Must be a string" });
      } else if (!ALLOWED_PART_TYPES.has(step["type"] as string) && !(step["type"] as string).startsWith("x-")) {
        errors.push({
          field: `${prefix}.composition[${i}].type`,
          message: `Unknown part type "${step["type"]}". Use a standard type or prefix with "x-" for custom types.`,
        });
      }
      if (typeof step["pool"] !== "string") {
        errors.push({ field: `${prefix}.composition[${i}].pool`, message: "Must be a string" });
      } else if (!(step["pool"] in pools)) {
        errors.push({
          field: `${prefix}.composition[${i}].pool`,
          message: `References unknown pool "${step["pool"]}"`,
        });
      }
      if (typeof step["position"] !== "number") {
        errors.push({ field: `${prefix}.composition[${i}].position`, message: "Must be a number" });
      } else {
        if (positions.has(step["position"] as number)) {
          errors.push({ field: `${prefix}.composition[${i}].position`, message: `Duplicate position ${step["position"]}` });
        }
        positions.add(step["position"] as number);
      }
    }
  }

  // displayOrder
  if (!Array.isArray(s["displayOrder"]) || s["displayOrder"].length === 0) {
    errors.push({ field: `${prefix}.displayOrder`, message: "Must be a non-empty array" });
  } else {
    const composition = Array.isArray(s["composition"]) ? s["composition"] as StyleDefinition["composition"] : [];
    const validPositions = new Set(composition.map((c) => c.position));
    for (const pos of s["displayOrder"] as unknown[]) {
      if (typeof pos !== "number") {
        errors.push({ field: `${prefix}.displayOrder`, message: "All entries must be numbers" });
        break;
      }
      if (!validPositions.has(pos)) {
        errors.push({
          field: `${prefix}.displayOrder`,
          message: `Position ${pos} not defined in composition`,
        });
      }
    }
  }
}
