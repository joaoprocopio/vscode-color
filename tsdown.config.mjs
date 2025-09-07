import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/extension.ts",
  outDir: "out",
  minify: true,
  noExternal: ["colorjs.io"],
  external: ["vscode"],
});
