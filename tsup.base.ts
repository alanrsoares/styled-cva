/**
 * Shared tsup options for packages. Import and spread in each package's tsup.config.ts.
 */
export const baseTsupOptions = {
  entry: ["src/index.ts"],
  sourcemap: true,
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
};
