import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ViewRecipeClient from "./client";
import { Metadata } from "next";

// Dans Next.js 15, params est une Promise
interface Props {
  params: Promise<{ id: string }>;
}

// 1. SEO Dynamique mis à jour
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params; // On attend la résolution de l'ID
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select("title")
    .eq("id", id)
    .single();

  return {
    title: recipe ? `${recipe.title} | MonCarnet` : "Recette",
  };
}

// 2. Page principale mise à jour
export default async function ViewRecipePage({ params }: Props) {
  const { id } = await params; // On attend la résolution de l'ID
  const supabase = await createClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !recipe) {
    return notFound();
  }

  return <ViewRecipeClient recipe={recipe} />;
}
