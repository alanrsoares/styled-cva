import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest } from "next/server";

import { DOCS_PAGES } from "~/lib/mcp-server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const host = request.headers.get("host") || url.host;
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;

  // Find and read the examples page content
  const examplesPage = DOCS_PAGES.find((p) => p.route === "/examples");
  let examplesContent = "";

  if (examplesPage) {
    try {
      const filePath = join(process.cwd(), "app", examplesPage.path);
      const rawContent = await readFile(filePath, "utf-8");
      // Remove frontmatter if present and any Next.js imports/exports if they exist
      const usageHeader = new RegExp(
        "^# Usage Examples\\n\\nCommon patterns and real-world examples using `@styled-cva/react`\\.\\n\\n",
      );
      examplesContent = rawContent
        .replace(/^---\n[\s\S]*?\n---\n/, "")
        .replace(usageHeader, "");
    } catch (error) {
      console.error("Failed to read examples for llms.txt", error);
    }
  }

  const content = [
    "# @styled-cva/react (styled-cva)",
    "",
    "> A typesafe, class-variance-authority-based, styled-components-like library for authoring React components",
    "",
    "## Documentation",
    ...DOCS_PAGES.map((page) => `- [${page.title}](${baseUrl}${page.route})`),
    "",
    "## MCP Server",
    `- Endpoint: ${baseUrl}/api/mcp`,
    "- Description: Model Context Protocol server providing documentation as resources and tools for search.",
    "",
    "## Features",
    "- **Type-safe**: Full TypeScript support with variant inference.",
    "- **CVA-based**: Built on top of class-variance-authority.",
    "- **Styled-components-like**: Familiar API for those coming from styled-components or emotion.",
    "- **Intrinsic CVA shorthand**: On HTML intrinsics, `tw.button(base, config)` is preferred; `tw.button.cva(base, config)` is deprecated but equivalent (React, Solid, Vue).",
    "- **Tailwind CSS**: Designed to work seamlessly with Tailwind CSS.",
    "- **Polymorphic**: Support for the `$as` prop to change the rendered element. Use the `PolymorphicComponentProps<Component, $As>` utility type to compose typed wrappers around custom-component targets (TanStack/Next/Remix Link, etc.) — automatically picks up every `$`-prefixed variant.",
    "- **Lint and format tooling**: First-party `@styled-cva/eslint-plugin` (extract long classNames into styled components, fixable), `@styled-cva/prettier-plugin` (normalize whitespace + multiline long `tw\\`…\\`` and `cva` strings), and `@styled-cva/biome-plugin` (diagnostics-only GritQL rules for `tw\\`…\\`` templates in Biome 2.x).",
    "- **Preact compatible**: Works under Preact via the standard `preact/compat` bundler alias — no styled-cva code changes needed.",
    "",
    "## Usage Examples",
    "",
    examplesContent,
  ].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
