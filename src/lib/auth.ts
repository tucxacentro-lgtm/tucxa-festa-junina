import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  canAccessAdminArea,
  type AdminProfile,
  type AdminRole,
} from "@/lib/admin-auth";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";

export type CurrentAdmin = {
  user: {
    id: string;
    email?: string;
  };
  profile: AdminProfile;
};

function getLoginRedirectPath(nextPath = "/admin/festa-junina") {
  return `/admin/login?next=${encodeURIComponent(nextPath)}`;
}

async function getUserFromStoredSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value;
  const supabase = createSupabaseServerClient();

  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (!error && data.user) {
      return data.user;
    }
  }

  if (refreshToken) {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (!error && data.user) {
      return data.user;
    }
  }

  return null;
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const user = await getUserFromStoredSession();

  if (!user) return null;

  const adminClient = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .eq("active", true)
    .single();

  if (profileError || !profile) return null;

  return {
    user: {
      id: user.id,
      email: user.email ?? undefined,
    },
    profile: profile as AdminProfile,
  };
}

export async function requireAdmin(allowedRoles?: AdminRole[], nextPath = "/admin/festa-junina") {
  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin) {
    redirect(getLoginRedirectPath(nextPath));
  }

  const admin = currentAdmin;

  if (!canAccessAdminArea(admin.profile.role, allowedRoles)) {
    redirect("/admin/festa-junina?erro=sem-permissao");
  }

  return admin;
}
