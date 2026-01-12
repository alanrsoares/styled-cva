import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolResult,
  type ListResourcesResult,
  type ListToolsResult,
  type ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Documentation pages mapping
export const DOCS_PAGES = [
  {
    path: "page.mdx",
    route: "/",
    title: "Introduction",
    resource: "styled-cva://docs/introduction",
  },
  {
    path: "getting-started/page.mdx",
    route: "/getting-started",
    title: "Getting Started",
    resource: "styled-cva://docs/getting-started",
  },
  {
    path: "testing/page.mdx",
    route: "/testing",
    title: "Testing",
    resource: "styled-cva://docs/testing",
  },
  {
    path: "api/page.mdx",
    route: "/api",
    title: "API Reference",
    resource: "styled-cva://docs/api",
  },
  {
    path: "mcp/page.mdx",
    route: "/mcp",
    title: "MCP Docs Server",
    resource: "styled-cva://docs/mcp",
  },
] as const;

// Zod schemas for tool inputs
const SearchDocsInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe("Search query to find relevant documentation"),
});

const ListDocsInputSchema = z.object({});

// Tool input schemas map
const TOOL_INPUT_SCHEMAS = {
  search_docs: SearchDocsInputSchema,
  list_docs: ListDocsInputSchema,
} as const;

type ToolName = keyof typeof TOOL_INPUT_SCHEMAS;

// Handler functions with proper types
export async function listResources(): Promise<ListResourcesResult> {
  return {
    resources: DOCS_PAGES.map((page) => ({
      uri: page.resource,
      name: page.title,
      description: `Documentation page: ${page.title}`,
      mimeType: "text/markdown",
    })),
  };
}

export async function readResource(uri: string): Promise<ReadResourceResult> {
  const page = DOCS_PAGES.find((p) => p.resource === uri);
  if (!page) {
    throw new Error(`Resource not found: ${uri}`);
  }

  try {
    const filePath = join(process.cwd(), "app", page.path);
    const content = await readFile(filePath, "utf-8");

    // Remove frontmatter if present
    const cleanedContent = content.replace(/^---\n[\s\S]*?\n---\n/, "");

    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: cleanedContent,
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to read resource ${uri}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function listTools(): Promise<ListToolsResult> {
  return {
    tools: [
      {
        name: "search_docs",
        description: "Search the styled-cva documentation by keyword or topic",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query to find relevant documentation",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "list_docs",
        description: "List all available documentation pages",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
}

export async function callTool(
  name: string,
  args: unknown,
): Promise<CallToolResult> {
  if (!(name in TOOL_INPUT_SCHEMAS)) {
    throw new Error(`Unknown tool: ${name}`);
  }

  const schema = TOOL_INPUT_SCHEMAS[name as ToolName];
  const validatedArgs = schema.parse(args);

  if (name === "list_docs") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            DOCS_PAGES.map((page) => ({
              title: page.title,
              route: page.route,
              resource: page.resource,
            })),
            null,
            2,
          ),
        },
      ],
    };
  }

  if (name === "search_docs") {
    const { query } = validatedArgs as z.infer<typeof SearchDocsInputSchema>;
    const lowerQuery = query.toLowerCase();

    // Simple keyword matching - in production, you might want more sophisticated search
    const matchingPages = DOCS_PAGES.filter((page) => {
      return (
        page.title.toLowerCase().includes(lowerQuery) ||
        page.route.toLowerCase().includes(lowerQuery)
      );
    });

    if (matchingPages.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No documentation pages found matching "${query}". Available pages: ${DOCS_PAGES.map((p) => p.title).join(", ")}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            matchingPages.map((page) => ({
              title: page.title,
              route: page.route,
              resource: page.resource,
            })),
            null,
            2,
          ),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

export function createMcpServer(): Server {
  const server = new Server(
    {
      name: "styled-cva-docs",
      version: "0.5.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    },
  );

  // List available documentation resources
  server.setRequestHandler(ListResourcesRequestSchema, listResources);

  // Read documentation resource content
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    return readResource(request.params.uri);
  });

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, listTools);

  // Handle tool calls with Zod validation
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return callTool(name, args ?? {});
  });

  return server;
}
