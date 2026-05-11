export const ADMIN_SESSION_COOKIE = "tucxa_admin_session";

export function getAdminEmail() {
  return process.env.ADMIN_USER_EMAIL || "admin@tucxa.local";
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

export function isAdminAuthConfigured() {
  return Boolean(getAdminPassword() && getAdminSessionSecret());
}

export function isValidAdminCredentials(email: string, password: string) {
  return (
    isAdminAuthConfigured() &&
    email.trim().toLowerCase() === getAdminEmail().trim().toLowerCase() &&
    password === getAdminPassword()
  );
}
