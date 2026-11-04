import { defineConfig } from "vite";
export default defineConfig({
  base:
    (globalThis as unknown as { process: { env: Record<string, string> } })
      .process.env.VITE_BASE_PATH || "/",
  build: { sourcemap: false },
});
