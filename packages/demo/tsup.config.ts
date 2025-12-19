import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      "auto-img-element.define": "./index.ts",
    },
    format: ["iife"],
    globalName: "AutoImg",
    outDir: "dist",
    outExtension: () => ({ js: ".global.js" }),
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
