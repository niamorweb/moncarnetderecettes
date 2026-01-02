import { createClient } from "@/lib/supabase/server"; // Ton helper supabase server
import { redirect } from "next/navigation";
import DashboardClient from "./client";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Vérification de la session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Récupération des recettes et catégories en parallèle
  const [recipesResponse, categoriesResponse] = await Promise.all([
    supabase
      .from("recipes")
      .select(`*, recipes_categories(name)`)
      .eq("user_id", user.id),
    supabase
      .from("recipes_categories")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
  ]);

  const formattedRecipes = (recipesResponse.data || []).map((recipe: any) => ({
    ...recipe,
    category_name: recipe.recipes_categories?.name || null,
  }));

  return (
    <DashboardClient
      initialRecipes={formattedRecipes}
      initialCategories={categoriesResponse.data || []}
      userId={user.id}
    />
  );
}
