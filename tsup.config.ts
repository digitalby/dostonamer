import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    outDir: "dist",
    sourcemap: true,
  },
  {
    entry: { cli: "src/cli/index.ts" },
    format: ["esm"],
    dts: false,
    clean: false,
    outDir: "dist",
    sourcemap: false,
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
