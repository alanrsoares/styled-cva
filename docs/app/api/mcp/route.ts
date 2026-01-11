import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  callTool,
  listResources,
  listTools,
  readResource,
} from "~/lib/mcp-server";

// JSON-RPC 2.0 request schema
const JsonRpcRequestSchema = z.object({
  jsonrpc: z.literal("2.0"),
  method: z.string(),
  params: z.unknown().optional(),
  id: z.union([z.string(), z.number(), z.null()]).optional(),
});

// Request parameter schemas
const ReadResourceParamsSchema = z.object({
  uri: z.string().min(1),
});

const CallToolParamsSchema = z.object({
  name: z.string().min(1),
  arguments: z.unknown().optional(),
});

function getCorsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function createJsonRpcError(
  code: number,
  message: string,
  id: string | number | null | undefined,
) {
  return {
    jsonrpc: "2.0" as const,
    error: {
      code,
      message,
    },
    id: id ?? null,
  };
}

export async function GET(request: NextRequest) {
  return handleMcpRequest(request);
}

export async function POST(request: NextRequest) {
  return handleMcpRequest(request);
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

async function handleMcpRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle GET requests (for SSE/streaming - basic implementation)
  if (request.method === "GET") {
    const headers = new Headers(corsHeaders);
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(
          encoder.encode(
            'data: {"type":"ready","server":"styled-cva-docs"}\n\n',
          ),
        );
      },
    });

    return new Response(stream, { headers });
  }

  // Handle POST requests (JSON-RPC 2.0)
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(createJsonRpcError(-32700, "Parse error", null), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Validate JSON-RPC request structure
  const validationResult = JsonRpcRequestSchema.safeParse(body);
  if (!validationResult.success) {
    const bodyId = (body as { id?: string | number | null })?.id;
    return NextResponse.json(
      createJsonRpcError(-32600, "Invalid Request", bodyId ?? null),
      { status: 400, headers: corsHeaders },
    );
  }

  const { method, params, id } = validationResult.data;

  try {
    let result: unknown;

    // Route to appropriate handler with Zod validation
    if (method === "resources/list") {
      result = await listResources();
    } else if (method === "resources/read") {
      const paramsResult = ReadResourceParamsSchema.safeParse(params);
      if (!paramsResult.success) {
        throw paramsResult.error;
      }
      result = await readResource(paramsResult.data.uri);
    } else if (method === "tools/list") {
      result = await listTools();
    } else if (method === "tools/call") {
      const paramsResult = CallToolParamsSchema.safeParse(params);
      if (!paramsResult.success) {
        throw paramsResult.error;
      }
      result = await callTool(
        paramsResult.data.name,
        paramsResult.data.arguments ?? {},
      );
    } else {
      throw new Error(`Unknown method: ${method}`);
    }

    return NextResponse.json(
      {
        jsonrpc: "2.0",
        result,
        id: id ?? null,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((issue) => issue.message)
        .join(", ");
      return NextResponse.json(
        createJsonRpcError(-32602, `Invalid params: ${errorMessages}`, id),
        { status: 400, headers: corsHeaders },
      );
    }

    return NextResponse.json(
      createJsonRpcError(
        -32603,
        error instanceof Error ? error.message : "Internal error",
        id,
      ),
      { status: 500, headers: corsHeaders },
    );
  }
}
