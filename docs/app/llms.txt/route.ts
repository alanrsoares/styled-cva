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
      examplesContent = rawContent
        .replace(/^---\n[\s\S]*?\n---\n/, "")
        .replace(/^# Usage Examples\n\nCommon patterns and real-world examples using `styled-cva`\.\n\n/, "");
    } catch (error) {
      console.error("Failed to read examples for llms.txt", error);
    }
  }

  const content = [
    "# styled-cva",
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
    "- **Tailwind CSS**: Designed to work seamlessly with Tailwind CSS.",
    "- **Polymorphic**: Support for the `$as` prop to change the rendered element.",
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
