"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BookType,
  ChefHat,
  ForkKnife,
  Move,
  Plus,
  PlusCircle,
  Trash,
  User,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Recipe, Category } from "@/types/recipe";
import ConfirmationModal from "@/components/ConfirmationModal";
import Button from "@/components/ui/button";

// --- PROPS DU COMPOSANT ---
interface DashboardClientProps {
  initialRecipes: Recipe[];
  initialCategories: Category[];
  userId: string;
}

// --- SOUS-COMPOSANT RECIPE CARD ---
const RecipeCard = ({
  recipe,
  index,
  isSelected,
  handleToggleSelectedRecipe,
  isARecipeSelected,
}: {
  recipe: Recipe;
  index: number;
  isSelected: boolean;
  handleToggleSelectedRecipe: (id: string) => void;
  isARecipeSelected: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`group relative border-2 rounded-[2rem] overflow-hidden transition-all duration-300 bg-white
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} 
        ${
          isSelected
            ? "border-orange-500 shadow-xl shadow-orange-100 scale-[0.98]"
            : "border-transparent shadow-sm hover:shadow-md hover:border-neutral-200"
        }`}
    >
      {/* 1. LIEN GLOBAL (La carte entière) */}
      <Link
        href={`/view-recipe/${recipe.id}`}
        onClick={(e) => {
          if (isARecipeSelected) {
            e.preventDefault();
            handleToggleSelectedRecipe(recipe.id);
          }
        }}
        className="absolute inset-0 z-10" // L'inset-0 couvre toute la carte
        aria-label={`Voir la recette ${recipe.title}`}
      />

      {/* 2. VISUELS (Image + Overlay) */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={
            recipe.image_url ||
            "https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=800"
          }
          alt={recipe.title}
          fill
          className={`object-cover transition-transform duration-700 group-hover:scale-110 ${
            isSelected ? "scale-110" : ""
          }`}
        />

        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isSelected
              ? "bg-orange-500/20 opacity-100"
              : "bg-black/10 lg:opacity-0 lg:group-hover:opacity-100"
          }`}
        />

        {/* 3. BOUTON SÉLECTION (Priorité haute via z-30) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // Empêche le Link global de s'activer
            handleToggleSelectedRecipe(recipe.id);
          }}
          className="absolute top-4 left-4 z-30"
        >
          <div
            className={`size-9 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-lg
            ${
              isSelected
                ? "bg-orange-500 border-orange-500 scale-110"
                : "bg-white border-white lg:opacity-0 lg:group-hover:opacity-100"
            }`}
          >
            <Plus
              className={`size-5 transition-transform ${
                isSelected ? "text-white rotate-45" : "text-orange-500"
              }`}
            />
          </div>
        </button>

        {/* 4. BOUTON MODIFIER (Priorité haute via z-30) */}
        {!isSelected && (
          <Link
            href={`/edit-recipe/${recipe.id}`}
            onClick={(e) => e.stopPropagation()} // Empêche le Link global
            className="absolute top-4 right-4 z-30 p-2 px-4 bg-white rounded-2xl transition-all duration-200 shadow-md lg:opacity-0 lg:group-hover:opacity-100"
          >
            <span className="text-sm font-bold text-neutral-800">Modifier</span>
          </Link>
        )}

        {recipe.category_name && (
          <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-neutral-600 shadow-sm">
            {recipe.category_name}
          </div>
        )}
      </div>

      {/* 5. CONTENU TEXTUEL (Sous le lien global visuellement) */}
      <div className="p-5">
        <h3 className="text-lg font-extrabold mb-3 text-neutral-800 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
          {recipe.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-neutral-500">
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <ForkKnife className="size-4 text-orange-400" />{" "}
              {recipe.prep_time + recipe.cook_time} min
            </span>
            {recipe.servings && (
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <Users className="size-4 text-orange-400" /> {recipe.servings}{" "}
                pers.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPOSANT DASHBOARD CLIENT ---
export default function DashboardClient({
  initialRecipes,
  initialCategories,
  userId,
}: DashboardClientProps) {
  const supabase = createClient();
  const router = useRouter();

  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null as "recipe" | "category" | null,
    data: null as string | null,
    title: "",
    description: "",
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(
      (x) => !selectedCategory || selectedCategory === x.category_id
    );
  }, [recipes, selectedCategory]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const { data, error } = await supabase
      .from("recipes_categories")
      .insert([{ name: newCategoryName, user_id: userId }])
      .select();
    if (!error && data) {
      setCategories([...categories, data[0]]);
      setNewCategoryName("");
      setIsAddingCategory(false);
      router.refresh();
    }
  };

  const handleToggleSelectedRecipe = (id: string) => {
    setSelectedRecipes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleMoveToCategory = async (categoryId: string | null) => {
    const { error } = await supabase
      .from("recipes")
      .update({ category_id: categoryId })
      .in("id", selectedRecipes);
    if (!error) {
      setRecipes(
        recipes.map((r) =>
          selectedRecipes.includes(r.id) ? { ...r, category_id: categoryId } : r
        )
      );
      setSelectedRecipes([]);
      setIsMoveMenuOpen(false);
      router.refresh();
    }
  };

  const handleDeleteSelected = async () => {
    const { error } = await supabase
      .from("recipes")
      .delete()
      .in("id", selectedRecipes);
    if (!error) {
      setRecipes(recipes.filter((r) => !selectedRecipes.includes(r.id)));
      setSelectedRecipes([]);
      router.refresh();
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const { error } = await supabase
      .from("recipes_categories")
      .delete()
      .eq("id", categoryId);
    if (!error) {
      setCategories(categories.filter((c) => c.id !== categoryId));
      if (selectedCategory === categoryId) setSelectedCategory(null);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Picker Modal */}
      {isPickerModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
            onClick={() => setIsPickerModalOpen(false)}
          />
          <div className="relative bg-neutral-50 rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 bg-white border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Piocher des recettes</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleMoveToCategory(selectedCategory);
                    setIsPickerModalOpen(false);
                  }}
                  className="px-6 py-2.5 bg-neutral-900 text-white font-bold rounded-xl"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setIsPickerModalOpen(false)}
                  className="p-2 text-neutral-400"
                >
                  <X />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes
                .filter((r) => r.category_id !== selectedCategory)
                .map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={() => handleToggleSelectedRecipe(recipe.id)}
                    className={`flex items-center gap-4 p-3 border-2 rounded-2xl cursor-pointer ${
                      selectedRecipes.includes(recipe.id)
                        ? "border-orange-500 bg-orange-50"
                        : "border-white bg-white"
                    }`}
                  >
                    <Image
                      src={recipe.image_url || "/placeholder.jpg"}
                      width={64}
                      height={64}
                      className="rounded-xl object-cover aspect-square"
                      alt=""
                    />
                    <h4 className="font-bold truncate">{recipe.title}</h4>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        description={modalConfig.description}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={() => {
          if (modalConfig.type === "recipe") handleDeleteSelected();
          if (modalConfig.type === "category" && modalConfig.data)
            handleDeleteCategory(modalConfig.data);
          setModalConfig({ ...modalConfig, isOpen: false });
        }}
      />

      {/* Floating Action Bar */}
      {selectedRecipes.length > 0 && (
        <div className="fixed bg-white p-3 border border-neutral-200 rounded-2xl z-[60] left-1/2 -translate-x-1/2 bottom-6 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <div className="relative">
            <button
              onClick={() => setIsMoveMenuOpen(!isMoveMenuOpen)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-orange-50 text-orange-700 font-bold"
            >
              <Move size={16} /> Déplacer
            </button>
            {isMoveMenuOpen && (
              <div className="absolute left-0 bottom-full mb-3 bg-white border border-neutral-200 shadow-xl rounded-2xl p-2 min-w-[200px]">
                <button
                  onClick={() => handleMoveToCategory(null)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50 text-sm"
                >
                  Aucune
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleMoveToCategory(cat.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50 text-sm"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() =>
              setModalConfig({
                isOpen: true,
                type: "recipe",
                data: null,
                title: "Supprimer ?",
                description: "Supprimer les recettes sélectionnées ?",
              })
            }
            className="px-4 py-1.5 text-red-600 font-bold hover:bg-red-50 rounded-md"
          >
            <Trash size={16} />
          </button>
          <button
            onClick={() => setSelectedRecipes([])}
            className="px-4 p-1.5 text-neutral-400 hover:bg-neutral-100 rounded-md"
          >
            <X />
          </button>
        </div>
      )}

      <div className="p-6 md:p-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <Button href="/account" variant="outline">
            <User size={20} /> Mon compte
          </Button>
          {recipes.length > 0 && (
            <Button href="/pdf-viewer" variant="secondary">
              <BookType size={20} /> Voir mon livre
            </Button>
          )}
        </div>

        <div
          className={`mb-10 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-2 tracking-tight">
            Mon Carnet de Recettes
          </h1>
          <p className="text-neutral-500 text-lg font-medium">
            Créez, organisez et transformez vos recettes en livre de cuisine.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2 rounded-full text-sm font-bold ${
                !selectedCategory
                  ? "bg-neutral-900 text-white shadow-lg"
                  : "bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-600"
              }`}
            >
              Toutes
            </button>
            {categories.map((x) => (
              <button
                key={x.id}
                onClick={() => setSelectedCategory(x.id)}
                className={`group relative flex items-center h-10 px-5 rounded-full text-sm font-bold border transition-all ${
                  selectedCategory === x.id
                    ? "bg-neutral-900 text-white pr-12"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                <span>{x.name}</span>
                {selectedCategory === x.id && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalConfig({
                        isOpen: true,
                        type: "category",
                        data: x.id,
                        title: `Supprimer ${x.name} ?`,
                        description:
                          "La catégorie sera supprimée, mais les recettes seront conservées.",
                      });
                    }}
                    className="absolute right-0 h-full w-10 bg-white/10 hover:bg-red-500 flex items-center justify-center rounded-r-full"
                  >
                    <Trash size={14} />
                  </span>
                )}
              </button>
            ))}
            {isAddingCategory ? (
              <form onSubmit={handleAddCategory}>
                <input
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onBlur={() => !newCategoryName && setIsAddingCategory(false)}
                  className="bg-white border-2 border-orange-400 px-4 py-2 rounded-full text-sm outline-none"
                  placeholder="Nom..."
                />
              </form>
            ) : (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="size-10 flex items-center justify-center rounded-full border border-dashed text-neutral-400 hover:border-orange-400 hover:text-orange-500"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
          <Button href="/new-recipe">
            <Plus size={20} /> Nouvelle recette
          </Button>
        </div>

        {recipes.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-neutral-200">
            <div className="text-7xl mb-6">🍳</div>
            <h3 className="text-2xl font-black mb-2">Votre carnet est vide</h3>
            <Link
              href="/new-recipe"
              className="inline-flex mt-6 px-8 py-4 bg-neutral-900 text-white font-black rounded-2xl shadow-2xl"
            >
              Ajouter ma première recette →
            </Link>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-[3rem] p-12 md:p-20 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-neutral-50 rounded-full blur-3xl -z-0 opacity-50" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-8 size-24 bg-neutral-50 flex items-center justify-center border border-neutral-100 group rounded-xl p-4">
                <ChefHat
                  size={40}
                  className="text-neutral-400 group-hover:text-orange-500 transition-colors duration-500"
                />
              </div>

              <h3 className="text-3xl font-black text-neutral-900 mb-3 tracking-tight">
                Cette catégorie est vide
              </h3>
              <p className="text-neutral-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                Il semblerait que vous n'ayez pas encore ajouté de pépites
                culinaires ici.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setIsPickerModalOpen(true)}
                >
                  Piocher des recettes
                </Button>

                <Button
                  href={`/new-recipe?category=${selectedCategory}`}
                  variant="primary"
                >
                  <PlusCircle size={18} />
                  Créer une recette ici
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredRecipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                index={index}
                handleToggleSelectedRecipe={handleToggleSelectedRecipe}
                isSelected={selectedRecipes.includes(recipe.id)}
                isARecipeSelected={selectedRecipes.length > 0}
              />
            ))}
            <Link
              href={`/new-recipe${
                selectedCategory ? `?category=${selectedCategory}` : ""
              }`}
              className="group aspect-square flex flex-col items-center justify-center gap-4 border-2 border-dashed border-neutral-200 rounded-[2rem] hover:border-orange-400 hover:bg-orange-50 transition-all text-neutral-400 hover:text-orange-600"
            >
              <div className="p-4 bg-neutral-100 group-hover:bg-orange-100 rounded-full">
                <Plus className="size-8 group-hover:rotate-90 transition-transform" />
              </div>
              <span className="font-black uppercase tracking-widest text-xs">
                Nouvelle recette
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
