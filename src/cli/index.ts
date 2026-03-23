import { parseArgs } from "node:util";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PackLoader } from "../packs/loader.js";
import { DostoNamer } from "../engine/generator.js";
import { formatJson } from "../rendering/renderer.js";

// Resolve the packs directory relative to this file.
// In the built output (dist/cli.js), packs/ lives two levels up.
// In source (src/cli/index.ts), packs/ is also two levels up.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DEFAULT_PACKS_DIR = join(__dirname, "../../packs");

function printHelp(): void {
  console.log(`
dostonamer — multilingual pseudonymous username generator

USAGE
  dostonamer [options]

OPTIONS
  --locale, -l  <locale>   Locale to use (default: en)
  --style,  -s  <style>    Style within locale (e.g. masculine, feminine)
  --count,  -n  <n>        Number of names to generate (default: 1)
  --seed        <n>        Integer seed for reproducible output
  --json                   Output JSON instead of plain text
  --list                   List available locales and styles, then exit
  --packs       <dir>      Path to packs directory (default: built-in)
  --help,   -h             Show this help

EXAMPLES
  dostonamer
  dostonamer --locale ru --style feminine --count 5
  dostonamer --locale en --seed 42 --json
  dostonamer --list
`);
}

function main(): void {
  const { values } = parseArgs({
    options: {
      locale: { type: "string", short: "l", default: "en" },
      style: { type: "string", short: "s" },
      count: { type: "string", short: "n", default: "1" },
      seed: { type: "string" },
      json: { type: "boolean", default: false },
      list: { type: "boolean", default: false },
      packs: { type: "string" },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: false,
  });

  if (values.help) {
    printHelp();
    process.exit(0);
  }

  const packsDir = values.packs ?? DEFAULT_PACKS_DIR;
  const loader = new PackLoader(packsDir);

  let namer: DostoNamer;
  try {
    namer = new DostoNamer(loader.loadAll());
  } catch (err) {
    console.error(`Error loading packs: ${(err as Error).message}`);
    process.exit(1);
  }

  if (values.list) {
    console.log("Available locales and styles:\n");
    for (const locale of namer.listLocales()) {
      const styles = namer.listStyles(locale).join(", ");
      console.log(`  ${locale}  →  ${styles}`);
    }
    process.exit(0);
  }

  const locale = values.locale ?? "en";
  const style = values.style;
  const count = Math.max(1, parseInt(values.count ?? "1", 10));
  const seed = values.seed !== undefined ? parseInt(values.seed, 10) : undefined;

  if (seed !== undefined && !Number.isInteger(seed)) {
    console.error("--seed must be an integer");
    process.exit(1);
  }

  try {
    const names = namer.generateMany(count, locale, style, seed);

    if (values.json) {
      const output = count === 1 ? formatJson(names[0]) : names.map(formatJson);
      console.log(JSON.stringify(output, null, 2));
    } else {
      for (const name of names) {
        console.log(name.display);
      }
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}

main();
