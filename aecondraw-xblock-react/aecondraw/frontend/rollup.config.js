import typescript from '@rollup/plugin-typescript';
import url from '@rollup/plugin-url';
import svgr from '@svgr/rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import { transform as intlTransform } from '@formatjs/ts-transformer';
import postcss from 'rollup-plugin-postcss';
import image from '@rollup/plugin-image';

export default (commandLineArgs) => {
  // Get input from command line, default to drawing.tsx
  const input = commandLineArgs.input || 'src/drawing.tsx';
  
  return {
    input,  // ✅ Add this
    output: {
      dir: '../public',
      format: 'iife',
      entryFileNames: '[name].js',
      sourcemap: true,
      inlineDynamicImports: true,  // Prevent code splitting for IIFE format
    },
    plugins: [
      postcss(),
      json(),
      svgr(),
      url({
        include: ['**/*.svg'],
        limit: 0,
      }),
      image(),
      typescript({
        transformers: () => ({
          before: [intlTransform({ overrideIdFn: '[sha512:contenthash:base64:6]', ast: true })],
        }),
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs({ transformMixedEsModules: true }),
    ]
  };
};
