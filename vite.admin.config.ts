import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/vvz-agenda/",
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: { admin: resolve(__dirname, "admin/index.html") },
    },
    minify: "esbuild",
  },
});
