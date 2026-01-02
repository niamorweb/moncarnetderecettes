import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import EditRecipeClient from "./client";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>; // Mise à jour du type en Promise
}) {
  // 1. On attend la résolution des paramètres de l'URL
  const { id } = await params;

  // 2. On attend l'initialisation du client Supabase
  const supabase = await createClient();

  // 3. Vérification de l'utilisateur
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 4. Récupération de la recette avec l'ID résolu
  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !recipe) {
    return notFound();
  }

  // On prépare les données pour le composant Client
  const initialData = {
    title: recipe.title || "",
    prepTime: recipe.prep_time ?? "",
    cookTime: recipe.cook_time ?? "",
    servings: recipe.servings ?? "",
    ingredients: recipe.ingredients?.length > 0 ? recipe.ingredients : [""],
    steps: recipe.steps?.length > 0 ? recipe.steps : [""],
    initialImageUrl: recipe.image_url,
    category_id: recipe.category_id,
  };

  return (
    <EditRecipeClient
      recipeId={id}
      initialData={initialData}
      userId={user.id}
    />
  );
}
