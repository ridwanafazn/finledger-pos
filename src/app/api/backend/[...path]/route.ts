import type { NextRequest } from "next/server";

const UPSTREAM =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export const dynamic = "force-dynamic";

const HOP_BY_HOP = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
];

/**
 * Same-origin proxy to the FinLedger Engine.
 *
 * The backend only allows its configured CORS origins, so the browser never
 * talks to it directly. This handler strips browser-origin headers and
 * forwards the request server-to-server, which also makes the app work on
 * any dev port.
 */
async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const search = request.nextUrl.search;
  const target = `${UPSTREAM}/${path.join("/")}${search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("origin");
  headers.delete("referer");
  headers.delete("content-length");
  for (const header of HOP_BY_HOP) {
    headers.delete(header);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch {
    return Response.json(
      {
        type: "about:blank",
        title: "Backend tidak dapat dihubungi",
        status: 502,
        detail: `Tidak ada respons dari ${UPSTREAM}.`,
        errorCode: "UPSTREAM_UNREACHABLE",
      },
      { status: 502, headers: { "content-type": "application/problem+json" } },
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  for (const header of HOP_BY_HOP) {
    responseHeaders.delete(header);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as OPTIONS,
};
