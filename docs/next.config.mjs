import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  basePath: basePath || undefined,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  transpilePackages: [
    "@styled-cva/core",
    "@styled-cva/react",
  ],
  serverExternalPackages: ["twoslash", "typescript", "@typescript/vfs"],
};

export default withMDX(config);
