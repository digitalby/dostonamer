import { describe, it, expect } from "vitest";
import { validatePack } from "../src/validation/validator.js";

const validPack = {
  locale: "test",
  version: "1.0.0",
  styles: {
    default: {
      composition: [
        { type: "given", pool: "names", position: 0 },
        { type: "surname", pool: "surnames", position: 1 },
      ],
      displayOrder: [0, 1],
    },
  },
  pools: {
    names: ["Alice", "Bob"],
    surnames: ["Smith", "Jones"],
  },
};

describe("validatePack — valid pack", () => {
  it("passes a well-formed pack", () => {
    const result = validatePack(validPack);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe("validatePack — structural failures", () => {
  it("fails when pack is not an object", () => {
    expect(validatePack(null).valid).toBe(false);
    expect(validatePack("string").valid).toBe(false);
    expect(validatePack(42).valid).toBe(false);
  });

  it("fails when locale is missing", () => {
    const result = validatePack({ ...validPack, locale: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "locale")).toBe(true);
  });

  it("fails when pools is not an object", () => {
    const result = validatePack({ ...validPack, pools: [] });
    expect(result.valid).toBe(false);
  });

  it("fails when a pool is empty", () => {
    const result = validatePack({
      ...validPack,
      pools: { ...validPack.pools, names: [] },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "pools.names")).toBe(true);
  });

  it("fails when a pool has duplicate entries", () => {
    const result = validatePack({
      ...validPack,
      pools: { ...validPack.pools, names: ["Alice", "Alice"] },
    });
    expect(result.valid).toBe(false);
  });

  it("fails when a composition step references an unknown pool", () => {
    const result = validatePack({
      ...validPack,
      styles: {
        default: {
          composition: [{ type: "given", pool: "nonexistent", position: 0 }],
          displayOrder: [0],
        },
      },
    });
    expect(result.valid).toBe(false);
  });

  it("fails when displayOrder references a position not in composition", () => {
    const result = validatePack({
      ...validPack,
      styles: {
        default: {
          composition: [{ type: "given", pool: "names", position: 0 }],
          displayOrder: [0, 99],
        },
      },
    });
    expect(result.valid).toBe(false);
  });

  it("fails when styles is empty", () => {
    const result = validatePack({ ...validPack, styles: {} });
    expect(result.valid).toBe(false);
  });
});
