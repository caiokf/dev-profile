/**
 * Cloudflare Worker: Notion API Proxy
 *
 * Proxies requests to Notion API, adding authentication and CORS headers.
 * This allows browser-based apps to access Notion without exposing the API key.
 *
 * Setup:
 * 1. pnpm install
 * 2. pnpm cf:secret NOTION_API_KEY (paste your secret_xxx key)
 * 3. pnpm cf:deploy
 */

type Env = {
  NOTION_API_KEY: string;
  ALLOWED_ORIGINS?: string; // Comma-separated list, e.g., "https://example.com,https://app.example.com"
};

const NOTION_API_BASE = "https://api.notion.com";
const NOTION_VERSION = "2022-06-28";

// Default allowed origins (localhost for dev, production domains)
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "https://caiokf.github.io",
  "https://dev.caiokf.com",
];

function getAllowedOrigins(env: Env): string[] {
  if (env.ALLOWED_ORIGINS) {
    return env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  }
  return DEFAULT_ALLOWED_ORIGINS;
}

function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

function corsHeaders(origin: string | null, allowedOrigins: string[]): HeadersInit {
  const allowedOrigin = origin && isOriginAllowed(origin, allowedOrigins) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function handleCORS(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin");
  const allowedOrigins = getAllowedOrigins(env);

  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(origin, allowedOrigins),
      "Access-Control-Max-Age": "86400",
    },
  });
}

async function proxyToNotion(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin");
  const allowedOrigins = getAllowedOrigins(env);

  // Validate origin
  if (origin && !isOriginAllowed(origin, allowedOrigins)) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin, allowedOrigins),
      },
    });
  }

  try {
    const url = new URL(request.url);
    const notionPath = url.pathname;
    const notionUrl = `${NOTION_API_BASE}${notionPath}${url.search}`;

    // Build request body if needed
    let body: string | undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.text();
    }

    // Forward to Notion API
    const notionResponse = await fetch(notionUrl, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${env.NOTION_API_KEY}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body,
    });

    // Get response body
    const responseBody = await notionResponse.text();

    // Return with CORS headers
    return new Response(responseBody, {
      status: notionResponse.status,
      statusText: notionResponse.statusText,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin, allowedOrigins),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin, allowedOrigins),
      },
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return handleCORS(request, env);
    }

    // Only allow GET, POST, PATCH
    if (request.method !== "GET" && request.method !== "POST" && request.method !== "PATCH") {
      return new Response("Method not allowed", { status: 405 });
    }

    return proxyToNotion(request, env);
  },
};
