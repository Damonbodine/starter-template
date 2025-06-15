import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

const packageJson = require('./package.json')

const external = ['zod']

const createConfig = (input, outputFile) => ({
  input,
  output: [
    {
      file: outputFile.replace('.esm.js', '.js'),
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: outputFile,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/*.test.*'],
    }),
  ],
  external,
})

export default [
  // Main bundle
  createConfig('src/index.ts', packageJson.module),
  
  // Types bundle
  createConfig('src/types/index.ts', 'dist/types.esm.js'),
  
  // Utils bundle
  createConfig('src/utils/index.ts', 'dist/utils.esm.js'),
  
  // Constants bundle
  createConfig('src/constants/index.ts', 'dist/constants.esm.js'),
  
  // Type definitions
  {
    input: 'dist/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/types.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
  {
    input: 'dist/utils/index.d.ts',
    output: [{ file: 'dist/utils.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
  {
    input: 'dist/constants/index.d.ts',
    output: [{ file: 'dist/constants.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
]