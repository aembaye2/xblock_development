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
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default (commandLineArgs) => {
  // Get input from command line, default to diagram.tsx
  const input = commandLineArgs.input || 'src/diagram.tsx';
  
  return {
    input,
    output: {
      dir: '../public',
      format: 'iife',
      entryFileNames: '[name].js',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    onwarn: (warning, warn) => {
      // Suppress circular dependency warnings from jsxgraph
      if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.ids?.some(id => id.includes('jsxgraph'))) {
        return;
      }
      // Suppress eval warnings from jsxgraph (intentionally used for parsing)
      if (warning.code === 'EVAL' && warning.id?.includes('jsxgraph')) {
        return;
      }
      // Show all other warnings
      warn(warning);
    },
    plugins: [
      postcss({
        plugins: [
          tailwindcss(),
          autoprefixer(),
        ],
        extract: false,  // Inline CSS instead of extracting to avoid code-splitting issues with IIFE
        inject: true,
        minimize: true,
      }),
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
