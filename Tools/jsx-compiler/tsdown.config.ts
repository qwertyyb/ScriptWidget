import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "iife",
  minify: true,
  outDir: "dist",
  deps: {
    alwaysBundle: [/.*/],
  },
});
