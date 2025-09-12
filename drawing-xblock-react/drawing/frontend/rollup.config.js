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

export default {
  output: {
  dir: '../public',
  format: 'iife',
  entryFileNames: '[name].js',
  sourcemap: true,  
  },
  plugins: [
    postcss(),
    json(),
  // Transform SVG imports into React components when imported as modules
  svgr(),
    url({
      include: ['**/*.svg'],
      limit: 0, // Always copy SVG files
    }),
    image(),
    typescript({
      // Configure a transformer to automatically add message IDs to <FormattedMessage /> and other react-intl usages
      transformers: () => ({
        before: [intlTransform({ overrideIdFn: '[sha512:contenthash:base64:6]', ast: true })],
      }),
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
    // Resolve node modules for browser (prefer browser field)
    nodeResolve({ browser: true, preferBuiltins: false }),
    // Convert CommonJS modules to ES modules so rollup can include them
    commonjs({ transformMixedEsModules: true }),
  ]
};
