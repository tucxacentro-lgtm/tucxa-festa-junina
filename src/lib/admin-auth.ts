import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_ACCESS_TOKEN_COOKIE = "tucxa_admin_access_token";
export const ADMIN_REFRESH_TOKEN_COOKIE = "tucxa_admin_refresh_token";
export const ADMIN_SESSION_COOKIE = "tucxa_admin_session";

export const ADMIN_ROLES = ["admin", "coordenador", "caixa", "cozinha", "entrega", "garcom"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminProfile = {
  id: string;
  full_name: string | null;
  role: AdminRole;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminSessionPayload = {
  userId: string;
  email?: string;
  role: AdminRole;
  expiresAt: number;
};

export function isAdminRole(value: string | null | undefined): value is AdminRole {
  return ADMIN_ROLES.includes(value as AdminRole);
}

export function canAccessAdminArea(role: AdminRole, allowedRoles?: AdminRole[]) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(role);
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSigningSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET ou chave Supabase não configurada para assinar a sessão administrativa.");
  }

  return secret;
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getSigningSecret()).update(encodedPayload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) return false;

  return timingSafeEqual(bufferA, bufferB);
}

export function createAdminSessionToken(payload: AdminSessionPayload) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): AdminSessionPayload | null {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) return null;

  const expectedSignature = signPayload(encodedPayload);

  if (!safeEqual(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<AdminSessionPayload>;

    if (!payload.userId || !payload.expiresAt || !isAdminRole(payload.role)) return null;

    if (payload.expiresAt < Date.now()) return null;

    return {
      userId: payload.userId,
      email: typeof payload.email === "string" ? payload.email : undefined,
      role: payload.role,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}
