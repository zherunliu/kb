import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@kb/content-guard/style.css",
        replacement: fromRoot("./packages/content-guard/style.css"),
      },
      {
        find: /^@kb\/content-guard$/,
        replacement: fromRoot("./packages/content-guard/src/index.ts"),
      },
      {
        find: /^@kb\/vitepress-content-guard$/,
        replacement: fromRoot(
          "./packages/vitepress-content-guard/src/index.ts",
        ),
      },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["packages/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["packages/*/src/**/*.ts"],
      exclude: ["packages/**/*.test.ts"],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
});
