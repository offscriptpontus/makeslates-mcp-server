#!/usr/bin/env node
/**
 * MakeSlates MCP Server
 *
 * A stdio-based MCP server that bridges to the MakeSlates HTTP API.
 * This allows Cursor, Claude Code, and other MCP clients to interact
 * with MakeSlates presentations.
 *
 * Usage:
 *   MAKESLATES_API_KEY=sk_live_xxx npx @makeslates/mcp-server
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// ============================================================================
// Configuration
// ============================================================================

const API_URL = process.env.MAKESLATES_API_URL || "https://makeslates.com/api/mcp";
const API_KEY = process.env.MAKESLATES_API_KEY;

const SERVER_INFO = {
  name: "makeslates-mcp",
  version: "0.1.0",
};

// ============================================================================
// Tool Definitions (matches the HTTP API)
// ============================================================================

const TOOLS: Tool[] = [
  {
    name: "list_workspaces",
    description: "List workspaces the user is a member of. Returns workspace id, name, slug, and role.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "list_presentations",
    description: "List presentations. Use workspaceId to filter by workspace, or omit for personal presentations.",
    inputSchema: {
      type: "object" as const,
      properties: {
        workspaceId: { type: "string", description: "Workspace ID to filter by (omit for personal presentations)" },
        limit: { type: "number", description: "Maximum number of presentations to return" },
        search: { type: "string", description: "Search term to filter presentations by title" },
      },
    },
  },
  {
    name: "get_presentation",
    description: "Get a presentation by ID with all its slides and content",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "The presentation ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "create_presentation",
    description: "Create a new empty presentation. Use create_presentation_with_slides for efficiency.",
    inputSchema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Title of the presentation" },
        workspaceId: { type: "string", description: "Workspace ID to create in (omit for personal)" },
        darkMode: { type: "boolean", description: "Set to true for dark theme, false for light theme" },
      },
      required: ["title"],
    },
  },
  {
    name: "create_presentation_with_slides",
    description: `Create a presentation with slides in one call.

Each slide needs a template ID and content fields. Use list_templates to see all templates and their contentFields.

Content fields map to element roles - pass them directly: { template: "big-number", number: "42%", label: "Growth" }`,
    inputSchema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Title of the presentation" },
        workspaceId: { type: "string", description: "Workspace ID to create in (omit for personal)" },
        darkMode: { type: "boolean", description: "Set to true for dark theme" },
        slides: {
          type: "array",
          items: {
            type: "object",
            properties: {
              template: { type: "string", description: "Template ID" },
            },
            required: ["template"],
          },
          description: "Array of slides with template and content",
        },
      },
      required: ["title", "slides"],
    },
  },
  {
    name: "update_presentation",
    description: "Update a presentation's metadata. Use update_slide for slide content.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "The presentation ID" },
        title: { type: "string", description: "New title" },
        darkMode: { type: "boolean", description: "Set to true for dark theme, false for light theme" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_presentation",
    description: "Soft-delete a presentation",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "The presentation ID to delete" },
      },
      required: ["id"],
    },
  },
  {
    name: "move_presentation",
    description: "Move a presentation to a different workspace, or to personal (no workspace). Only the presentation creator can move it.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "The presentation ID to move" },
        workspaceId: { type: "string", description: "Target workspace ID, or omit/null to move to personal" },
      },
      required: ["id"],
    },
  },
  {
    name: "add_slide_from_template",
    description: `THE ONLY WAY TO ADD SLIDES - Uses pre-designed templates.

ALWAYS use this tool. NEVER use add_slide.
Templates: title, section, image-full, two-column, quote, big-number, chart-bar, etc.

1. Call list_templates first
2. Pick the best template
3. Use this tool to add the slide
4. Use update_slide only to change text content`,
    inputSchema: {
      type: "object" as const,
      properties: {
        presentationId: { type: "string", description: "The presentation ID" },
        template: {
          type: "string",
          description: 'Template ID from list_templates (e.g. "title", "image-full", "two-column")',
        },
        position: { type: "number", description: "Position to insert (0-indexed). Omit to append." },
      },
      required: ["presentationId", "template"],
    },
  },
  {
    name: "update_slide",
    description: `Update a slide's content. Replaces elements array entirely.

Design rules:
- backgroundColor: ALWAYS "default"
- font: ALWAYS "default"
- Text color: ALWAYS "default"`,
    inputSchema: {
      type: "object" as const,
      properties: {
        presentationId: { type: "string", description: "The presentation ID" },
        slideIndex: { type: "number", description: "Index of the slide to update (0-indexed)" },
        backgroundColor: { type: "string", description: 'ALWAYS "default"' },
        elements: {
          type: "array",
          description: "Array of elements. Each MUST have id, type, and position {x,y,width,height}",
        },
      },
      required: ["presentationId", "slideIndex"],
    },
  },
  {
    name: "delete_slide",
    description: "Delete a slide from a presentation",
    inputSchema: {
      type: "object" as const,
      properties: {
        presentationId: { type: "string", description: "The presentation ID" },
        slideIndex: { type: "number", description: "Index of the slide to delete (0-indexed)" },
      },
      required: ["presentationId", "slideIndex"],
    },
  },
  {
    name: "list_templates",
    description: `MANDATORY FIRST STEP - List all available slide templates.

YOU MUST call this before adding any slides. Templates are the ONLY way to create good-looking slides.
Each template has perfect spacing, typography, and layout built-in.`,
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_schema",
    description: "Get schema reference. Usually not needed - just use templates.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_upload_url",
    description: `Get a presigned URL for fast direct image uploads.

Returns:
- uploadUrl: POST your image file here directly
- publicUrl: Use this URL in your slides after upload

This is MUCH faster than base64 encoding. Upload directly to storage.`,
    inputSchema: {
      type: "object" as const,
      properties: {
        filename: { type: "string", description: 'Image filename (e.g. "hero.jpg", "chart.png")' },
        contentType: { type: "string", description: 'MIME type (e.g. "image/jpeg", "image/png"). Defaults to image/jpeg' },
      },
      required: ["filename"],
    },
  },
];

// ============================================================================
// HTTP API Bridge
// ============================================================================

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

async function callHttpApi(
  method: string,
  params?: Record<string, unknown>
): Promise<JsonRpcResponse> {
  if (!API_KEY) {
    return {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32000,
        message: "MAKESLATES_API_KEY environment variable is not set. Get your API key at https://makeslates.com/settings",
      },
    };
  }

  const request: JsonRpcRequest = {
    jsonrpc: "2.0",
    id: Date.now(),
    method,
    params,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32000,
          message: `HTTP ${response.status}: ${text}`,
        },
      };
    }

    return (await response.json()) as JsonRpcResponse;
  } catch (error) {
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32000,
        message: `Network error: ${error instanceof Error ? error.message : String(error)}`,
      },
    };
  }
}

// ============================================================================
// MCP Server
// ============================================================================

async function main() {
  // Check for API key early
  if (!API_KEY) {
    console.error("Error: MAKESLATES_API_KEY environment variable is required.");
    console.error("");
    console.error("To get an API key:");
    console.error("  1. Go to https://makeslates.com/settings");
    console.error("  2. Generate an API key");
    console.error("  3. Set it in your environment or MCP config");
    console.error("");
    console.error("Example:");
    console.error('  MAKESLATES_API_KEY=sk_live_xxx npx @makeslates/mcp-server');
    process.exit(1);
  }

  const server = new Server(SERVER_INFO, {
    capabilities: {
      tools: {},
    },
  });

  // Handle tools/list
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Handle tools/call
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Forward to HTTP API
    const response = await callHttpApi("tools/call", {
      name,
      arguments: args,
    });

    if (response.error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${response.error.message}`,
          },
        ],
        isError: true,
      };
    }

    // The HTTP API returns { content: [{ type: "text", text: "..." }] }
    const result = response.result as { content?: Array<{ type: string; text: string }>; isError?: boolean };

    return {
      content: result?.content || [{ type: "text" as const, text: JSON.stringify(result) }],
      isError: result?.isError,
    };
  });

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdio is used for MCP communication)
  console.error(`MakeSlates MCP server started (API: ${API_URL})`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
