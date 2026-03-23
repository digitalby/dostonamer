# Contributing a new locale pack

The fastest way to extend dostonamer is to add a JSON pack file.

## Steps

1. **Copy** `packs/en.json` or `packs/ru.json` as a starting point.
2. **Rename** it to `packs/<locale>.json` (use a BCP-47-style key, e.g. `ja`, `hu`, `ar-eg`).
3. **Edit** the `pools` and `styles` sections:
   - Add as many named pools as you need.
   - Define one or more styles. Each style lists composition steps and a display order.
   - For surname-first locales set `"displayOrder": [1, 0]`.
   - For single-name locales use one composition step with `"type": "single"`.
4. **Run** `npm test` — the loader will pick up your pack automatically and the validator will report any schema errors.

## Pack schema reference

```
NamePack
  locale      string          BCP-47 key
  version     string          semver
  styles      object          named styles
    <name>
      description?  string    shown in --list
      composition   array     ordered steps
        type        string    given | surname | patronymic | single | particle | honorific | clan | x-*
        pool        string    key into pools
        position    number    unique integer
      displayOrder  number[]  positions in output order
  pools       object          named word lists (arrays of strings, no duplicates)
```

## Naming guidelines

- Avoid names of living public figures, slurs, or words that commonly trigger content filters.
- The pack should feel culturally coherent but not tied to any real person.
- "Absurd but plausible" is fine for stylised packs.

## Code contributions

- Keep functions small and explicit.
- Add tests for new behavior in `tests/`.
- Run `npm run typecheck` before submitting.
