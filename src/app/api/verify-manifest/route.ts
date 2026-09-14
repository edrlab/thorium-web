import { NextResponse } from "next/server";
import { verifyManifestUrlFromEnv } from "@/next-lib/helpers/verifyManifest";

// This function runs on the server
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const manifestUrl = searchParams.get("url");
  
  if (!manifestUrl) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  // Same-origin manifests (e.g. locally-hosted publications under /public) are
  // always trusted, regardless of MANIFEST_ALLOWED_DOMAINS — they're served by
  // this app itself, not a third party, and the allowed origin changes with
  // every deployment (preview branches, production).
  try {
    if (new URL(manifestUrl).origin === new URL(request.url).origin) {
      return NextResponse.json({ allowed: true, url: manifestUrl });
    }
  } catch {
    // Fall through to the regular validation, which will report the invalid URL
  }

  const result = verifyManifestUrlFromEnv(manifestUrl);

  if (!result.allowed) {
    return NextResponse.json(
      { error: result.error || "Domain not allowed" },
      { status: result.error === "Invalid URL" ? 400 : 403 }
    );
  }
  
  return NextResponse.json({ 
    allowed: true,
    url: result.url
  });
}
