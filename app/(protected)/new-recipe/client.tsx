"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { ChevronLeft, Loader2, Plus, X } from "lucide-react";
import Button from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
}

interface RecipeFormData {
  title: string;
  servings: string;
  prepTime: string;
  cookTime: string;
  imageFile: File | null;
  ingredients: string[];
  steps: string[];
  category_id: string | null;
}

const BUCKET_NAME = "recipe_images";

export default function NewRecipeClient({
  initialCategories,
  userId,
}: {
  initialCategories: Category[];
  userId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [recipeData, setRecipeData] = useState<RecipeFormData>({
    title: "",
    servings: "",
    prepTime: "",
    cookTime: "",
    imageFile: null,
    ingredients: [""],
    steps: [""],
    category_id: null,
  });

  const inputClass =
    "w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all placeholder:text-neutral-400";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setRecipeData({ ...recipeData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setRecipeData({ ...recipeData, imageFile: file });
  };

  const handleArrayChange = (
    type: "ingredients" | "steps",
    index: number,
    value: string
  ) => {
    const newArray = [...recipeData[type]];
    newArray[index] = value;
    setRecipeData({ ...recipeData, [type]: newArray });
  };

  const handleAdd = (type: "ingredients" | "steps") => {
    setRecipeData({ ...recipeData, [type]: [...recipeData[type], ""] });
  };

  const handleRemove = (type: "ingredients" | "steps", index: number) => {
    const newArray = recipeData[type].filter((_, i) => i !== index);
    setRecipeData({ ...recipeData, [type]: newArray.length ? newArray : [""] });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let categoryId = recipeData.category_id;

      // 1. Gestion nouvelle catégorie
      if (newCategoryName.trim()) {
        const { data: newCat, error: catError } = await supabase
          .from("recipes_categories")
          .insert({ user_id: userId, name: newCategoryName.trim() })
          .select("id")
          .single();
        if (catError) throw catError;
        categoryId = newCat.id;
      }

      // 2. Upload image
      let finalImageUrl: string | null = null;
      if (recipeData.imageFile) {
        const fileName = `${uuidv4()}.${recipeData.imageFile.name
          .split(".")
          .pop()}`;
        const filePath = `${userId}/${fileName}`;
        const { error: upError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, recipeData.imageFile);
        if (upError) throw upError;
        finalImageUrl = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath).data.publicUrl;
      }

      // 3. Insertion
      const { error: dbError } = await supabase.from("recipes").insert({
        user_id: userId,
        title: recipeData.title,
        category_id: categoryId,
        servings: recipeData.servings ? parseInt(recipeData.servings) : null,
        prep_time: recipeData.prepTime ? parseInt(recipeData.prepTime) : null,
        cook_time: recipeData.cookTime ? parseInt(recipeData.cookTime) : null,
        image_url: finalImageUrl,
        ingredients: recipeData.ingredients.filter((i) => i.trim()),
        steps: recipeData.steps.filter((s) => s.trim()),
      });

      if (dbError) throw dbError;

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen bg-neutral-50 py-12 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <Button href="/dashboard" variant="ghost" size="md">
          <ChevronLeft size={20} /> Retour
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* GAUCHE : INFOS DE BASE */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-neutral-100">
              <h1 className="text-3xl font-black mb-8">Nouvelle Recette</h1>

              <div className="mb-8">
                <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-3">
                  Photo
                </label>
                <div className="relative aspect-video rounded-3xl border-2 border-dashed border-neutral-200 overflow-hidden bg-neutral-50 hover:border-orange-400 transition-colors">
                  {recipeData.imageFile ? (
                    <Image
                      src={URL.createObjectURL(recipeData.imageFile)}
                      alt="Aperçu"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-400 font-bold">
                      Ajouter une image
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <input
                  name="title"
                  placeholder="Ex: Tarte Tatin"
                  value={recipeData.title}
                  onChange={handleChange}
                  required
                  className={`${inputClass} text-lg font-bold`}
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    name="prepTime"
                    type="number"
                    value={recipeData.prepTime}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Prép"
                  />
                  <input
                    name="cookTime"
                    type="number"
                    value={recipeData.cookTime}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Cuisson"
                  />
                  <input
                    name="servings"
                    type="number"
                    value={recipeData.servings}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Pers"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DROITE : CONTENU */}
          <div className="lg:col-span-7 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-bold">
                {error}
              </div>
            )}

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl">
              <h2 className="text-2xl font-black mb-6">Ingrédients</h2>
              <div className="space-y-3">
                {recipeData.ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      value={ing}
                      onChange={(e) =>
                        handleArrayChange("ingredients", index, e.target.value)
                      }
                      className={inputClass}
                      placeholder="2 oeufs..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove("ingredients", index)}
                      className="text-neutral-300 hover:text-red-500"
                    >
                      <X />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleAdd("ingredients")}
                className="w-full mt-4 p-3 border-2 border-dashed hover:border-orange-400 rounded-xl text-neutral-400 hover:text-orange-700 font-semibold"
              >
                + Ingrédient
              </button>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl">
              <h2 className="text-2xl font-black mb-6">Préparation</h2>
              <div className="space-y-6">
                {recipeData.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <span className="size-10 bg-neutral-900 text-white font-black rounded-2xl flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <textarea
                      value={step}
                      onChange={(e) =>
                        handleArrayChange("steps", index, e.target.value)
                      }
                      rows={3}
                      className={inputClass}
                      placeholder="Détail de l'étape..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove("steps", index)}
                      className="text-neutral-300 hover:text-red-500"
                    >
                      <X />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleAdd("steps")}
                className="w-full mt-4 p-3 border-2 border-dashed hover:border-orange-400 rounded-xl text-neutral-400 hover:text-orange-700 font-semibold"
              >
                + Étape
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Floating Footer */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-50 p-2 rounded-2xl shadow-2xl border border-neutral-200 flex gap-4 z-50">
        <Button type="submit" disabled={loading} variant="primary">
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Enregistrer la recette"
          )}
        </Button>
      </div>
    </form>
  );
}
