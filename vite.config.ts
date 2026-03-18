import { defineConfig } from "vite";

export default defineConfig({
  base: "/vvz-agenda/",
  build: {
    lib: {
      entry: "src/main.ts",
      name: "VvzAgenda",
      formats: ["iife"],
      fileName: () => "vvz-agenda.js",
    },
    outDir: "dist",
    minify: "esbuild",
  },
});
