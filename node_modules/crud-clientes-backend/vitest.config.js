import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["../test/backend/**/*.spec.js"],
    coverage: {
      enabled: true,
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/**/*.js"],
      exclude: ["**/node_modules/**", "src/index.js"]
    },
  },
});
