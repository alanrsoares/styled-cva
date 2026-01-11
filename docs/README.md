# styled-cva Documentation

This directory contains the Nextra documentation site for styled-cva.

## Development

To start the development server:

```bash
npm run dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

To build the documentation site:

```bash
npm run build
# or
pnpm build
# or
bun build
```

## Start Production Server

To start the production server:

```bash
npm run start
# or
pnpm start
# or
bun start
```

## Project Structure

- `app/` - Next.js app directory with MDX pages
- `public/` - Static assets (images, icons, etc.)
- `next.config.mjs` - Next.js and Nextra configuration
- `theme.config.tsx` - Nextra theme configuration
- `mdx-components.jsx` - Custom MDX components

## Adding New Pages

Create new `.mdx` files in the `app/` directory. The file structure determines the URL:

- `app/page.mdx` → `/`
- `app/getting-started/page.mdx` → `/getting-started`
- `app/api/page.mdx` → `/api`

Update `app/_meta.js` to control the sidebar navigation order and titles.
