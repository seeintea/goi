import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'cjs',
      output: {
        distPath: { root: './dist' },
        filename: { js: '[name].cjs' },
      },
      dts: { bundle: true },
    },
  ],
  output: {
    target: 'node',
  },
  tools: {
    swc: {
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
    },
  },
});
