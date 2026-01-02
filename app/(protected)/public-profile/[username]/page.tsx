import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PublicProfileClient from "./client";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  // On récupère le profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  // Si pas de profil, on affiche la 404 de Next.js immédiatement
  if (!profile) return notFound();

  // On récupère le reste
  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", profile.id);

  const { data: categories } = await supabase
    .from("recipes_categories")
    .select("*")
    .eq("user_id", profile.id);

  // TRÈS IMPORTANT : On passe les props individuellement
  return (
    <PublicProfileClient
      profile={profile}
      recipes={recipes || []}
      categories={categories || []}
    />
  );
}
