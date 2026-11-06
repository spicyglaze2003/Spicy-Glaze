import { NextResponse } from "next/server";

// Cache responses in memory for high performance
const memoryCache = new Map<string, { data: ArrayBuffer; contentType: string; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

function createSvgPlaceholder(title: string, subtitle: string, isWarning = false): Response {
  const bg = isWarning ? "#fff7ed" : "#f8fafc";
  const border = isWarning ? "#fdba74" : "#e2e8f0";
  const iconColor = isWarning ? "#ea580c" : "#94a3b8";
  const textColor = isWarning ? "#9a3412" : "#334155";
  const subColor = isWarning ? "#c2410c" : "#64748b";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
    <rect width="600" height="600" fill="${bg}"/>
    <rect x="20" y="20" width="560" height="560" rx="24" stroke="${border}" stroke-width="2" stroke-dasharray="8 8"/>
    <g transform="translate(300, 240)">
      <circle r="48" fill="${iconColor}" opacity="0.12"/>
      <path d="M-18 -12 L18 -12 C20 -12 22 -10 22 -8 L22 18 C22 20 20 22 18 22 L-18 22 C-20 22 -22 20 -22 18 L-22 -8 C-22 -10 -20 -12 -18 -12 Z" fill="none" stroke="${iconColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="-10" cy="-2" r="3" fill="${iconColor}"/>
      <path d="M-22 14 L-10 2 L4 16 L12 8 L22 18" fill="none" stroke="${iconColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="300" y="340" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="700" fill="${textColor}">
      ${title}
    </text>
    <text x="300" y="375" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500" fill="${subColor}">
      ${subtitle}
    </text>
  </svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id || typeof id !== "string") {
      return createSvgPlaceholder("Invalid Image ID", "No Google Drive file ID provided", true);
    }

    // Clean any query params or size tags from fileId
    const cleanId = id.split(/[?&=]/)[0].trim();

    // Check memory cache
    const cached = memoryCache.get(cleanId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return new Response(cached.data, {
        status: 200,
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Candidate Google Drive image URLs to fetch
    const candidateUrls = [
      `https://drive.google.com/thumbnail?id=${cleanId}&sz=w1600`,
      `https://lh3.googleusercontent.com/d/${cleanId}=w1600`,
      `https://drive.google.com/uc?export=download&id=${cleanId}`,
    ];

    let imageData: ArrayBuffer | null = null;
    let contentType = "image/jpeg";
    let isRestricted = false;

    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          },
          redirect: "follow",
        });

        clearTimeout(timeout);

        if (!res.ok) {
          if (res.status === 403 || res.status === 401) {
            isRestricted = true;
          }
          continue;
        }

        const resContentType = res.headers.get("content-type") || "";

        // If Google returned HTML, it means login/redirect/restricted access or virus confirmation page
        if (resContentType.includes("text/html")) {
          isRestricted = true;
          continue;
        }

        const arrayBuffer = await res.arrayBuffer();
        if (arrayBuffer.byteLength > 200) {
          imageData = arrayBuffer;
          contentType = resContentType.startsWith("image/") ? resContentType : "image/jpeg";
          break;
        }
      } catch {
        // Try next candidate URL
      }
    }

    if (imageData) {
      // Store in memory cache
      memoryCache.set(cleanId, {
        data: imageData,
        contentType,
        timestamp: Date.now(),
      });

      return new Response(imageData, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    if (isRestricted) {
      return createSvgPlaceholder(
        "Google Drive File Is Private",
        "Set share access to 'Anyone with the link can view'",
        true
      );
    }

    return createSvgPlaceholder(
      "Product Image Preview",
      "SpicyGlaze Artisanal Spice Collection",
      false
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Drive image proxy error:", msg);
    return createSvgPlaceholder(
      "Image Unavailable",
      "Unable to fetch image from Google Drive",
      true
    );
  }
}
