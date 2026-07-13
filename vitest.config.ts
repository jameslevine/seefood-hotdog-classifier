import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      // Only measure the business logic we can meaningfully unit/integration
      // test. Excluded: thin SDK/Next glue exercised end-to-end instead
      // (Cognito calls + cookie IO in auth.ts, client construction in aws.ts),
      // and all non-source.
      include: ["lib/**/*.ts"],
      exclude: ["lib/auth.ts", "lib/aws.ts", "lib/types.ts"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});
