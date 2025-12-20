import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      "index.webcomponent": "./index.webcomponent.ts",
    },
    format: ["iife"],
    outDir: "dist",
    outExtension: () => ({ js: ".bundle.js" }),
    platform: "browser",
    minify: false,
    clean: true,
  },
  {
    entry: {
      "index.api": "./index.api.ts",
    },
    format: ["iife"],
    outDir: "dist",
    outExtension: () => ({ js: ".bundle.js" }),
    platform: "browser",
    minify: false,
    clean: true,
  },
  {
    entry: ["./playground.ts", "./canvas_helper.ts"],
    format: ["iife"],
    outDir: "dist",
    outExtension: () => ({ js: ".bundle.js" }),
    platform: "browser",
    target: "es2020",
    minify: false,
    dts: false,
  },
]);
