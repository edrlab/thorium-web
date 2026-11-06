import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    plugins: {
      "unused-imports": unusedImports,
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      ".vercel/**",
      ".wrangler/**",
      ".open-next/**",
      ".rollup.cache/**",
    ],
  },
  {
    files: [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src/**/*.test.{js,jsx,ts,tsx}",
      "!src/**/__tests__/**",
      "!src/**/__mocks__/**"
    ],
    rules: {
      // Unused imports rule
      "unused-imports/no-unused-imports": "warn",
      "no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_", 
        "varsIgnorePattern": "^_", 
        "caughtErrorsIgnorePattern": "^_" 
      }],

      // Your existing rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/exhaustive-deps-misuse": "off",
      "react-hooks/stable-deps": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react-hooks/globals": "off",
      "react-hooks/use-memo": "off"
    }
  },
];

export default eslintConfig;