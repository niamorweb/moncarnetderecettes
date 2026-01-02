import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "./client";

export default async function ProfilePage() {
  const supabase = await createClient();

  // 1. Vérification de la session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Récupération des données du profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, public_name")
    .eq("id", user.id)
    .single();

  return (
    <ProfileClient
      user={user}
      initialData={{
        username: profile?.username || "",
        public_name: profile?.public_name || "",
      }}
    />
  );
}
