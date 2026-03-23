import { describe, it, expect, beforeAll } from "vitest";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PackLoader } from "../src/packs/loader.js";
import { DostoNamer } from "../src/engine/generator.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKS_DIR = join(__dirname, "../packs");

let namer: DostoNamer;

beforeAll(() => {
  const loader = new PackLoader(PACKS_DIR);
  namer = new DostoNamer(loader.loadAll());
});

describe("DostoNamer.listLocales", () => {
  it("includes en and ru", () => {
    const locales = namer.listLocales();
    expect(locales).toContain("en");
    expect(locales).toContain("ru");
  });
});

describe("DostoNamer.listStyles", () => {
  it("en has masculine, feminine, neutral", () => {
    const styles = namer.listStyles("en");
    expect(styles).toContain("masculine");
    expect(styles).toContain("feminine");
    expect(styles).toContain("neutral");
  });

  it("ru has masculine and feminine", () => {
    const styles = namer.listStyles("ru");
    expect(styles).toContain("masculine");
    expect(styles).toContain("feminine");
  });
});

describe("DostoNamer.generate — English", () => {
  it("returns a GeneratedName with expected shape", () => {
    const name = namer.generate("en", "feminine", 1);
    expect(name.locale).toBe("en");
    expect(name.style).toBe("feminine");
    expect(name.seed).toBe(1);
    expect(name.display).toMatch(/^\S+ \S+$/);
    expect(name.parts).toHaveLength(2);
    expect(name.parts[0].type).toBe("given");
    expect(name.parts[1].type).toBe("surname");
  });

  it("is deterministic: same seed yields same name", () => {
    const a = namer.generate("en", "masculine", 42);
    const b = namer.generate("en", "masculine", 42);
    expect(a.display).toBe(b.display);
  });

  it("different seeds yield different names (with very high probability)", () => {
    const a = namer.generate("en", "feminine", 1);
    const b = namer.generate("en", "feminine", 99999);
    // This could theoretically fail if both happen to pick the same words
    // but is practically impossible with a large dictionary.
    expect(a.display).not.toBe(b.display);
  });
});

describe("DostoNamer.generate — Russian", () => {
  it("returns a GeneratedName for ru masculine", () => {
    const name = namer.generate("ru", "masculine", 7);
    expect(name.locale).toBe("ru");
    expect(name.style).toBe("masculine");
    expect(name.parts).toHaveLength(2);
  });

  it("returns a GeneratedName for ru feminine", () => {
    const name = namer.generate("ru", "feminine", 8);
    expect(name.locale).toBe("ru");
    expect(name.parts).toHaveLength(2);
  });

  it("is deterministic for Russian", () => {
    const a = namer.generate("ru", "masculine", 100);
    const b = namer.generate("ru", "masculine", 100);
    expect(a.display).toBe(b.display);
  });
});

describe("DostoNamer.generateMany", () => {
  it("returns the requested count", () => {
    const names = namer.generateMany(5, "en", "neutral", 42);
    expect(names).toHaveLength(5);
  });

  it("is deterministic", () => {
    const a = namer.generateMany(3, "en", "masculine", 77);
    const b = namer.generateMany(3, "en", "masculine", 77);
    expect(a.map((n) => n.display)).toEqual(b.map((n) => n.display));
  });

  it("returns an empty array for count < 1", () => {
    expect(namer.generateMany(0, "en")).toHaveLength(0);
  });
});

describe("DostoNamer — error handling", () => {
  it("throws for an unknown locale", () => {
    expect(() => namer.generate("xx")).toThrow(/locale/i);
  });

  it("throws for an unknown style", () => {
    expect(() => namer.generate("en", "fictional")).toThrow(/style/i);
  });
});
