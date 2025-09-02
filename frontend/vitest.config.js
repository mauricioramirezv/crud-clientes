import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["../test/frontend/**/*.test.js"],
    coverage: {
      enabled: true,
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/**/*.js"],
      exclude: ["**/node_modules/**"]
    },
  },
});
