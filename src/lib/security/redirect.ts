/**
 * Validates and sanitizes a redirect URL to prevent Open Redirect attacks.
 * Only allows safe relative internal paths starting with a single '/'
 * and rejects external URLs (https://...), protocol-relative URLs (//evil.com),
 * backslash evasion (/\evil.com), or javascript:/data: pseudo-protocols.
 */
export function getSafeRedirectUrl(
  url: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const trimmed = url.trim();

  // Must start with exactly one '/' and NOT with '//' or '/\'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }

  // Reject backslashes anywhere (URL path traversal / browser normalization tricks)
  if (trimmed.includes("\\")) {
    return fallback;
  }

  // Reject colons before any query parameter (prevent scheme tricks like /http:// or javascript:)
  const pathPart = trimmed.split("?")[0];
  if (pathPart.includes(":")) {
    return fallback;
  }

  // Reject control characters, spaces, or invalid URI characters
  if (/[\x00-\x1F\x7F\s]/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}
