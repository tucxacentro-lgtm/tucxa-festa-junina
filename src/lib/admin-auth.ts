export const ADMIN_ACCESS_TOKEN_COOKIE = "tucxa_admin_access_token";
export const ADMIN_REFRESH_TOKEN_COOKIE = "tucxa_admin_refresh_token";

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

export function isAdminRole(value: string | null | undefined): value is AdminRole {
  return ADMIN_ROLES.includes(value as AdminRole);
}

export function canAccessAdminArea(role: AdminRole, allowedRoles?: AdminRole[]) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(role);
}
