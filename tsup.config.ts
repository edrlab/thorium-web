import svgrPlugin from "esbuild-plugin-svgr";

import { defineConfig } from "tsup";

export default defineConfig({
  name: "Thorium Web",
  tsconfig: "./tsconfig.bundle.json",
  format: ["esm"],
  entry: [
    "src/core/Components/index.ts",
    "src/core/Helpers/index.ts",
    "src/core/Hooks/index.ts", 
    "src/components/Misc/index.ts",
    "src/components/Audio/index.ts",
    "src/components/Divina/index.ts",
    "src/components/Epub/index.ts",
    "src/components/WebPub/index.ts",
    "src/components/Reader/index.ts",
    "src/i18n/index.ts",
    "src/lib/index.ts",
    "src/preferences/index.ts",
    "src/next-lib/index.ts"
  ],
  loader: {
    ".css": "local-css"
  },
  esbuildPlugins: [svgrPlugin()],
  sourcemap: true,
  clean: true,
  dts: true,
  treeshake: true,
  splitting: true,
  bundle: true,
  noExternal: [
    "classNames", 
    "debounce",
    "colorthief"
  ],
  external: [
    "react", 
    "react-dom", 
    "react-redux", 
    "@reduxjs/toolkit", 
    "react-aria", 
    "react-aria-components", 
    "react-stately", 
    "react-resizable-panels", 
    "react-modal-sheet",
    "i18next",
    "i18next-browser-languagedetector",
    "i18next-http-backend",
    "motion",
    "@readium/css",
    "@readium/navigator",
    "@readium/navigator-html-injectables",
    "@readium/shared"
  ]
});