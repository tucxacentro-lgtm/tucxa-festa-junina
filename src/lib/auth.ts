import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_ACCESS_TOKEN_COOKIE, canAccessAdminArea, type AdminProfile, type AdminRole } from "@/lib/admin-auth";
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

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) return null;

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

  if (userError || !userData.user) return null;

  const adminClient = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from("admin_profiles")
    .select("*")
    .eq("id", userData.user.id)
    .eq("active", true)
    .single();

  if (profileError || !profile) return null;

  return {
    user: {
      id: userData.user.id,
      email: userData.user.email ?? undefined,
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
