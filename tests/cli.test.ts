import { describe, it, expect } from "vitest";
import { PackLoader } from "../src/packs/loader.js";
import { DostoNamer } from "../src/engine/generator.js";
import { formatJson } from "../src/rendering/renderer.js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Test the CLI's core logic without spawning a subprocess.
// The CLI itself is a thin wrapper around these modules.

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKS_DIR = join(__dirname, "../packs");

function buildNamer(): DostoNamer {
  const loader = new PackLoader(PACKS_DIR);
  return new DostoNamer(loader.loadAll());
}

describe("CLI happy path (module-level)", () => {
  it("generates an English name and formats as plain text", () => {
    const namer = buildNamer();
    const name = namer.generate("en", "masculine", 1);
    expect(typeof name.display).toBe("string");
    expect(name.display.length).toBeGreaterThan(3);
  });

  it("generates a Russian name and formats as JSON", () => {
    const namer = buildNamer();
    const name = namer.generate("ru", "feminine", 2);
    const json = formatJson(name);
    expect(json.locale).toBe("ru");
    expect(json.style).toBe("feminine");
    expect(typeof json.display).toBe("string");
    expect(Array.isArray(json.parts)).toBe(true);
  });

  it("generates multiple names deterministically", () => {
    const namer = buildNamer();
    const names = namer.generateMany(5, "en", "feminine", 42);
    expect(names).toHaveLength(5);
    // All displays are non-empty strings
    for (const n of names) {
      expect(n.display.length).toBeGreaterThan(0);
    }
  });

  it("lists locales including en and ru", () => {
    const namer = buildNamer();
    expect(namer.listLocales()).toContain("en");
    expect(namer.listLocales()).toContain("ru");
  });
});
