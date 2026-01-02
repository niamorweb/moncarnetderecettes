"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Utensils, ChefHat, Pen, ArrowLeft } from "lucide-react";
import { Recipe } from "@/types/recipe";
import Button from "@/components/ui/button";

export default function ViewRecipeClient({ recipe }: { recipe: Recipe }) {
  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Navigation */}
        <div className="mb-10 flex items-center justify-between">
          <Button href="/dashboard" variant="ghost">
            <ChevronLeft size={14} /> Dashboard
          </Button>

          <Button href={`/edit-recipe/${recipe.id}`} variant="outline">
            <Pen size={18} className="text-orange-500" />
            <span>Modifier</span>
          </Button>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Meta & Image */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-neutral-100 lg:sticky lg:top-12">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl mb-8 bg-neutral-100 shadow-inner">
                <Image
                  src={
                    recipe.image_url ||
                    "https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=2000"
                  }
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  priority // Charge cette image immédiatement
                />
              </div>

              <h1 className="text-4xl font-black text-neutral-900 mb-8 leading-tight tracking-tight">
                {recipe.title}
              </h1>

              {/* Time & Servings Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
                  <div className="text-lg font-black text-neutral-900">
                    {recipe.prep_time || 0}m
                  </div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-neutral-400 mt-1">
                    Prép.
                  </div>
                </div>
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
                  <div className="text-lg font-black text-neutral-900">
                    {recipe.cook_time || 0}m
                  </div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-neutral-400 mt-1">
                    Cuisson
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center">
                  <div className="text-lg font-black text-orange-600">
                    {recipe.servings || 0}
                  </div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-orange-400 mt-1">
                    Pers.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Ingredients & Steps */}
          <div className="lg:col-span-7 space-y-8">
            {/* Ingredients Section */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-neutral-100">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-neutral-100">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Utensils className="size-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-black text-neutral-900">
                  Ingrédients
                </h2>
              </div>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipe.ingredients.map((ing, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-transparent hover:border-orange-200 transition-all group"
                  >
                    <span className="size-7 bg-white text-neutral-900 text-xs font-black rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      {index + 1}
                    </span>
                    <span className="text-neutral-700 font-bold text-sm leading-relaxed">
                      {ing}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preparation Section */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-neutral-100">
              <div className="flex items-center gap-3 mb-10 pb-4 border-b border-neutral-100">
                <div className="p-2 bg-neutral-900 rounded-lg">
                  <ChefHat className="size-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-neutral-900">
                  Préparation
                </h2>
              </div>

              <div className="space-y-10">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <span className="size-12 bg-neutral-900 text-white font-black rounded-[1.2rem] flex items-center justify-center shrink-0 text-lg shadow-lg">
                        {index + 1}
                      </span>
                      {index !== recipe.steps.length - 1 && (
                        <div className="w-0.5 flex-1 bg-neutral-100 my-2" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-neutral-700 text-lg leading-relaxed font-medium">
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
