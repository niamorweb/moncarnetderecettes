import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewRecipeClient from "./client";

export default async function NewRecipePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: categories } = await supabase
    .from("recipes_categories")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  return (
    <NewRecipeClient initialCategories={categories || []} userId={user.id} />
  );
}
