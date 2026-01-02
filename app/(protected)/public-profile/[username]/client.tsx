"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ForkKnife, Users, ChefHat } from "lucide-react";
import { Recipe, Category } from "@/types/recipe";

// Interface pour le profil
interface Profile {
  username: string;
  public_name?: string;
}

interface PublicProfileClientProps {
  profile: Profile; // Type plus strict que 'any'
  recipes: Recipe[];
  categories: Category[];
}

export default function PublicProfileClient({
  profile,
  recipes = [],
  categories = [],
}: PublicProfileClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];

    return recipes.filter(
      (x) => !selectedCategory || selectedCategory === x.category_id
    );
  }, [recipes, selectedCategory]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="p-6 md:p-12 max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-black uppercase tracking-widest text-neutral-400 shadow-sm">
          <ChefHat className="size-4 text-orange-500" />
          Carnet Partagé
        </div>

        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight">
            Les recettes de{" "}
            <span className="text-orange-600">
              {profile.public_name || profile.username}
            </span>
          </h1>
          <p className="text-neutral-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            Explorez sa collection personnelle de saveurs et d'aventures
            culinaires.
          </p>
        </div>

        {/* Filtres Catégories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              !selectedCategory
                ? "bg-neutral-900 text-white shadow-lg"
                : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400"
            }`}
          >
            Toutes les recettes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-neutral-900 text-white shadow-lg"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-16 text-center shadow-sm">
            <div className="text-7xl mb-6">🍳</div>
            <h3 className="text-2xl font-black text-neutral-900 mb-2">
              Encore un peu de patience...
            </h3>
            <p className="text-neutral-500 font-medium">
              Cet utilisateur n'a pas encore partagé de recettes ici.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredRecipes.map((recipe, index) => (
              <PublicRecipeCard key={recipe.id} recipe={recipe} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PublicRecipeCard({
  recipe,
  index,
}: {
  recipe: Recipe;
  index: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Link
      href={`/view-recipe/${recipe.id}`}
      className={`group bg-white border-2 border-transparent rounded-[2rem] overflow-hidden shadow-sm hover:border-neutral-200 transition-all duration-300 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="relative h-52 overflow-hidden bg-neutral-100">
        <Image
          src={recipe.image_url || "/images/illustration.jpeg"}
          alt={recipe.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-black text-neutral-800 mb-4 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
          {recipe.title}
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
            <ForkKnife className="size-4 text-orange-400" />
            {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
          </div>
          {recipe.servings && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
              <Users className="size-4 text-orange-400" />
              {recipe.servings} pers.
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
