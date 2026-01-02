"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { ChevronLeft, X, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/button";

interface RecipeFormData {
  title: string;
  prepTime: string | number;
  cookTime: string | number;
  servings: string | number;
  ingredients: string[];
  steps: string[];
  imageFile: File | null;
  initialImageUrl?: string | null;
  category_id?: string | null;
}

interface EditRecipeClientProps {
  recipeId: string;
  initialData: Omit<RecipeFormData, "imageFile">;
  userId: string;
}

const BUCKET_NAME = "recipe_images";

export default function EditRecipeClient({
  recipeId,
  initialData,
  userId,
}: EditRecipeClientProps) {
  const [recipeData, setRecipeData] = useState<RecipeFormData>({
    ...initialData,
    imageFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const inputClass =
    "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all placeholder:text-gray-400";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      let finalImageUrl = recipeData.initialImageUrl;

      if (recipeData.imageFile) {
        const fileExt = recipeData.imageFile.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, recipeData.imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);
        finalImageUrl = publicUrlData.publicUrl;
      }

      const { error: dbError } = await supabase
        .from("recipes")
        .update({
          title: recipeData.title,
          servings: recipeData.servings
            ? parseInt(recipeData.servings.toString())
            : null,
          prep_time: recipeData.prepTime
            ? parseInt(recipeData.prepTime.toString())
            : null,
          cook_time: recipeData.cookTime
            ? parseInt(recipeData.cookTime.toString())
            : null,
          image_url: finalImageUrl,
          ingredients: recipeData.ingredients.filter((i) => i.trim()),
          steps: recipeData.steps.filter((s) => s.trim()),
        })
        .eq("id", recipeId);

      if (dbError) throw dbError;

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen bg-neutral-50 pt-12 pb-32 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button href="/dashboard" variant="ghost" size="md">
            <ChevronLeft size={14} /> Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* COLONNE GAUCHE */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-neutral-100">
              <h1 className="text-3xl font-black mb-6 text-neutral-900">
                Édition
              </h1>

              <div className="mb-6">
                <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-3">
                  Photo
                </label>
                <div className="relative aspect-video rounded-3xl border-2 border-dashed border-neutral-200 overflow-hidden bg-neutral-50">
                  {recipeData.imageFile || recipeData.initialImageUrl ? (
                    <Image
                      src={
                        recipeData.imageFile
                          ? URL.createObjectURL(recipeData.imageFile)
                          : recipeData.initialImageUrl!
                      }
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
                  value={recipeData.title}
                  onChange={handleChange}
                  className={`${inputClass} text-lg font-bold`}
                  placeholder="Titre..."
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

          {/* COLONNE DROITE */}
          <div className="lg:col-span-7 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-bold">
                {error}
              </div>
            )}

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl">
              <h2 className="text-2xl font-black mb-6 text-neutral-900">
                Ingrédients
              </h2>
              <div className="space-y-3">
                {recipeData.ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      value={ing}
                      onChange={(e) =>
                        handleArrayChange("ingredients", index, e.target.value)
                      }
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove("ingredients", index)}
                      className="text-neutral-300 cursor-pointer hover:text-red-500"
                    >
                      <X />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleAdd("ingredients")}
                className="w-full mt-4 p-3 border-2 border-dashed duration-150 hover:border-orange-400 rounded-xl text-neutral-400 font-bold"
              >
                + Ajouter
              </button>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl">
              <h2 className="text-2xl font-black mb-6 text-neutral-900">
                Préparation
              </h2>
              <div className="space-y-6">
                {recipeData.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <textarea
                      value={step}
                      onChange={(e) =>
                        handleArrayChange("steps", index, e.target.value)
                      }
                      rows={3}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove("steps", index)}
                      className="text-neutral-300 cursor-pointer hover:text-red-500"
                    >
                      <X />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleAdd("steps")}
                className="w-full mt-6 p-3 border-2 border-dashed duration-150 hover:border-orange-400 rounded-xl text-neutral-400 font-bold"
              >
                + Ajouter une étape
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Footer */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-50 p-2 rounded-2xl shadow-2xl border border-neutral-200 flex gap-4 z-50">
        <Button type="button" onClick={() => router.back()} variant="outline">
          Annuler
        </Button>
        <Button type="submit" disabled={loading} variant="primary">
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>
    </form>
  );
}
