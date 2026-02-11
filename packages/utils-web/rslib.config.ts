import { defineConfig } from "@rslib/core"

export default defineConfig({
  lib: [
    {
      format: "esm",
      output: {
        distPath: { root: "./dist" },
        filename: { js: "[name].mjs" },
      },
      dts: { bundle: true },
    },
  ],
})
