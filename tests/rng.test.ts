import { describe, it, expect } from "vitest";
import { createSeededRng, randomSeed } from "../src/engine/rng.js";

describe("createSeededRng", () => {
  it("produces a float in [0, 1)", () => {
    const rng = createSeededRng(1);
    const v = rng.next();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });

  it("is deterministic: same seed yields same sequence", () => {
    const a = createSeededRng(42);
    const b = createSeededRng(42);
    for (let i = 0; i < 20; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it("different seeds produce different sequences", () => {
    const a = createSeededRng(1);
    const b = createSeededRng(2);
    const va = Array.from({ length: 10 }, () => a.next());
    const vb = Array.from({ length: 10 }, () => b.next());
    expect(va).not.toEqual(vb);
  });

  it("nextInt returns integers in [0, max)", () => {
    const rng = createSeededRng(7);
    for (let i = 0; i < 100; i++) {
      const v = rng.nextInt(10);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(10);
    }
  });
});

describe("randomSeed", () => {
  it("returns an unsigned 32-bit integer", () => {
    const s = randomSeed();
    expect(Number.isInteger(s)).toBe(true);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(0xffffffff);
  });
});
