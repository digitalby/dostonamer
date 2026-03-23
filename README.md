# dostonamer

A small, clean, extensible library and CLI for generating human-readable pseudonymous usernames shaped by language-specific dictionaries.

```
$ dostonamer --locale en --style feminine --count 4 --seed 42
Cordelia Ellsworth
Beatrice Kirkwood
Thomasina Norwood
Willa Halcott

$ dostonamer --locale ru --style masculine --count 3 --seed 7
Харитон Карнаухов
Феодор Шатунов
Евлампий Угрюмов
```

## Why this project exists

Sometimes you need a username that is readable and memorable but not tied to a real person. This project generates names that feel culturally shaped by a locale — English names that sound vaguely 19th-century New England, Russian names with a literary-bureaucratic flavour — while remaining clearly fictional.

## Architecture

The design is intentionally locale-agnostic at the core. Not every language uses given-name + surname, and not every language puts the given name first. The engine knows nothing about this; all composition rules live in the pack JSON files.

```
src/
  domain/types.ts        — core interfaces (NamePart, GeneratedName, NamePack, …)
  engine/
    rng.ts               — seeded PRNG (Mulberry32, zero deps)
    generator.ts         — DostoNamer: loads packs, runs composition, renders
  packs/
    loader.ts            — reads *.json from the packs/ directory
  validation/
    validator.ts         — checks packs for schema errors at load time
  rendering/
    renderer.ts          — joins parts in pack-defined displayOrder
  cli/
    index.ts             — thin CLI wrapper using Node's parseArgs
  index.ts               — public re-exports

packs/
  en.json                — Anglosphere pack (~80 entries per category)
  ru.json                — Russian literary/bureaucratic pack

tests/                   — vitest unit tests
```

Key design decisions:

- **Interface-first.** `NamePart.position` + `StyleDefinition.displayOrder` decouple composition from rendering. A surname-first locale just uses `displayOrder: [1, 0]`.
- **No hardwired two-part assumption.** Composition is an array; a single-name locale has one step.
- **Seeded PRNG (Mulberry32).** Zero dependencies, reproducible across JS engines. Same seed + same pack + same code version = same output.
- **Pack validation at load time.** Bad pack data fails fast with readable errors rather than producing wrong output silently.
- **No magic.** No decorators, no IoC container, no reflection. Functions and classes you can read in five minutes.

## Install & run

```bash
# Install dependencies
npm install

# Build
npm run build

# Run the CLI
node dist/cli.js --help
node dist/cli.js --locale en --style neutral --count 5
node dist/cli.js --locale ru --style feminine --seed 42 --json

# Run tests
npm test
```

## Using the library

```typescript
import { createNamer, PackLoader } from "dostonamer";
import { join } from "node:path";

const loader = new PackLoader(join(import.meta.dirname, "../packs"));
const namer = createNamer(loader.loadAll());

// Generate one name (random seed)
console.log(namer.generate("en").display);

// Seeded, reproducible
console.log(namer.generate("ru", "feminine", 42).display);

// Batch
const names = namer.generateMany(10, "en", "masculine", 99);
names.forEach(n => console.log(n.display));

// Inspect structure
const name = namer.generate("en", "feminine", 1);
console.log(name.parts);   // [{ type: "given", value: "Nora", position: 0 }, …]
console.log(name.seed);    // 1
console.log(name.locale);  // "en"
```

## Adding a new language pack

1. Create `packs/<locale>.json` following this schema:

```json
{
  "locale": "ja",
  "version": "1.0.0",
  "styles": {
    "default": {
      "description": "Surname before given name (Japanese convention)",
      "composition": [
        { "type": "given",   "pool": "given_names", "position": 0 },
        { "type": "surname", "pool": "surnames",    "position": 1 }
      ],
      "displayOrder": [1, 0]
    }
  },
  "pools": {
    "given_names": ["Haruki", "Yuki", "Kenji"],
    "surnames":    ["Murakami", "Tanaka", "Suzuki"]
  }
}
```

Key points:
- `displayOrder: [1, 0]` renders surname first without touching the engine.
- A single-name locale (e.g. Indonesian mononym) uses one composition step with `type: "single"`.
- Icelandic patronymics can add a third step with `type: "patronymic"`.
- Any pool name is valid; style names are free-form strings.

2. The pack is picked up automatically on next run (no code changes needed).

3. Run `npm test` to make sure validation passes.

## CLI reference

```
dostonamer [options]

  --locale, -l  <locale>   Locale (default: en)
  --style,  -s  <style>    Style within locale (e.g. masculine, feminine)
  --count,  -n  <n>        Number of names (default: 1)
  --seed        <n>        Integer seed for reproducible output
  --json                   Output JSON
  --list                   List locales and styles
  --packs       <dir>      Custom packs directory
  --help,   -h             Help
```

## Current limitations

- No transliteration (Russian output is Cyrillic only).
- English pack has ~80 entries per category — intentionally small for readability.
- Seeded `generate()` and `generateMany()` use different RNG streams (by design: `generate` is always isolated; `generateMany` streams from one seed).
- No CLI piping of pack paths from env variable yet.

## License

MIT — see LICENSE.
