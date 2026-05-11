import { headers } from "next/headers";

const DEFAULT_PUBLIC_SITE_URL = "https://tucxa-festa-junina.vercel.app";

function cleanUrl(value?: string | null) {
  return value?.trim().replace(/\/$/, "") || "";
}

function isPrivateOrLocalUrl(value: string) {
  return (
    !value ||
    value.includes("localhost") ||
    value.includes("127.0.0.1") ||
    value.includes("vercel.com/login")
  );
}

export function getConfiguredPublicSiteUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_PRODUCTION_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "",
    DEFAULT_PUBLIC_SITE_URL,
  ].map(cleanUrl);

  return candidates.find((candidate) => !isPrivateOrLocalUrl(candidate)) ?? DEFAULT_PUBLIC_SITE_URL;
}

export async function getServerPublicSiteUrl() {
  const configured = getConfiguredPublicSiteUrl();
  if (!isPrivateOrLocalUrl(configured)) return configured;

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";

  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return `${protocol}://${host}`.replace(/\/$/, "");
  }

  return DEFAULT_PUBLIC_SITE_URL;
}

export function buildPublicUrl(path: string) {
  const baseUrl = getConfiguredPublicSiteUrl();
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
