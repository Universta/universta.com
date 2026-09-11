import type { NextRequest } from "next/server";
import { proxyInternalLinks } from "@/lib/server/internal-links-proxy";

/** The rich-text editor's inline `%` autocomplete. Same read-only proxy as the
 * link picker's search, which is what every admin API call goes through -- a
 * fetch to a path with no route handler here is a 404 before it ever reaches
 * the API. */
export async function GET(request: NextRequest) {
  return proxyInternalLinks(request, "/entities");
}
