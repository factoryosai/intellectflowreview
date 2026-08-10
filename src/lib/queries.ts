import { supabase } from "@/integrations/supabase/client";

export async function getMyBusiness() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase.from("businesses").select("*").eq("user_id", u.user.id).limit(1).maybeSingle();
  return data;
}

export async function getMyProfile() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
  return data;
}
