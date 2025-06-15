import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

const packageJson = require('./package.json')

export default [
  // Main bundle
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.*', '**/*.stories.*'],
      }),
    ],
    external: ['react', 'react-native', 'react-dom'],
  },
  // Web-specific bundle
  {
    input: 'src/web.ts',
    output: [
      {
        file: 'dist/web.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/web.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.*', '**/*.stories.*'],
      }),
    ],
    external: ['react', 'react-dom'],
  },
  // Native-specific bundle
  {
    input: 'src/native.ts',
    output: [
      {
        file: 'dist/native.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/native.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        browser: false,
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.*', '**/*.stories.*'],
      }),
    ],
    external: ['react', 'react-native'],
  },
  // Type definitions
  {
    input: 'dist/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
  {
    input: 'dist/web.d.ts',
    output: [{ file: 'dist/web.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
  {
    input: 'dist/native.d.ts',
    output: [{ file: 'dist/native.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
]