"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Download,
  Layers,
  Search,
  Loader2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import RecipePrintView from "@/components/RecipePrintView";
import { Recipe } from "@/types/recipe";
import Button from "@/components/ui/button";

export default function PdfViewerClient({
  initialRecipes,
}: {
  initialRecipes: Recipe[];
}) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(
    initialRecipes[0] || null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Pour le mobile
  const printContainerRef = useRef<HTMLDivElement>(null);

  // --- LOGIQUE DE TRI ---
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(recipes);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    setRecipes(items);
  };

  const move = (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= recipes.length) return;
    const items = Array.from(recipes);
    const [removed] = items.splice(index, 1);
    items.splice(newIndex, 0, removed);
    setRecipes(items);
  };

  const generatePDF = async () => {
    if (!printContainerRef.current) return;
    setIsGenerating(true);
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
      });
      const elements = printContainerRef.current.children;
      for (let i = 0; i < elements.length; i++) {
        const canvas = await html2canvas(elements[i] as HTMLElement, {
          scale: 2, // Réduit légèrement pour mobile performance
          useCORS: true,
          backgroundColor: "#ffffff",
          width: 559,
          height: 794,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.9);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, 148, 210, undefined, "FAST");
      }
      pdf.save("Mon_Livre_de_Recettes.pdf");
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredRecipes = useMemo(
    () =>
      recipes.filter((r) =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [recipes, searchTerm]
  );

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden font-sans relative">
      {/* OVERLAY MOBILE POUR FERMER LA SIDEBAR */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ASIDE : Responsive Drawer */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-40 w-[85%] sm:w-[350px] bg-neutral-100 border-r border-neutral-200 
        flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        {/* HEADER SIDEBAR */}
        <div className="p-4 border-b border-neutral-200 bg-white lg:bg-transparent">
          <div className="flex justify-between items-center lg:block">
            <Button
              href="/dashboard"
              variant="ghost"
              className="px-0 hover:bg-transparent"
            >
              <ChevronLeft size={18} /> Dashboard
            </Button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2"
            >
              <X size={24} />
            </button>
          </div>

          <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2 mt-6 mb-4">
            <Layers size={18} className="text-orange-600" /> Ordre des Pages
          </h2>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={14}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-white lg:bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="Chercher une recette..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* LISTE DND - Optimisée Touch */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="recipes">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {filteredRecipes.map((recipe, index) => (
                    <Draggable
                      key={recipe.id}
                      draggableId={recipe.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-2 mb-2 group"
                        >
                          {/* Grip caché sur mobile car on privilégie les flèches */}
                          <div
                            {...provided.dragHandleProps}
                            className="hidden lg:block text-neutral-300 hover:text-neutral-600 cursor-grab"
                          >
                            <GripVertical size={20} />
                          </div>

                          <button
                            onClick={() => {
                              setActiveRecipe(recipe);
                              if (window.innerWidth < 1024)
                                setIsSidebarOpen(false);
                            }}
                            className={`flex-1 flex items-center gap-3 p-2 rounded-xl border-2 transition-all text-left ${
                              activeRecipe?.id === recipe.id
                                ? "bg-orange-50 border-orange-200 shadow-sm"
                                : "bg-white border-transparent shadow-sm"
                            }`}
                          >
                            <div className="relative size-10 shrink-0 rounded-lg overflow-hidden border border-neutral-100">
                              <Image
                                src={recipe.image_url || "/placeholder.jpg"}
                                fill
                                className="object-cover"
                                alt=""
                              />
                            </div>
                            <span
                              className={`text-xs font-bold line-clamp-2 ${
                                activeRecipe?.id === recipe.id
                                  ? "text-orange-700"
                                  : "text-neutral-700"
                              }`}
                            >
                              {recipe.title}
                            </span>
                          </button>

                          {/* Contrôles tactiles (Flèches) - Toujours visibles sur mobile */}
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => move(index, -1)}
                              disabled={index === 0}
                              className="p-1 rounded bg-white border border-neutral-200 disabled:opacity-30 shadow-sm"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={() => move(index, 1)}
                              disabled={index === recipes.length - 1}
                              className="p-1 rounded bg-white border border-neutral-200 disabled:opacity-30 shadow-sm"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* ACTION PANEL */}
        <div className="p-4 border-t border-neutral-200 bg-white">
          <Button
            onClick={generatePDF}
            disabled={isGenerating || recipes.length === 0}
            size="lg"
            className="w-full shadow-lg shadow-orange-200"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Download size={18} />
            )}
            {isGenerating ? "Création..." : "Télécharger PDF"}
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-neutral-200 flex flex-col items-center relative">
        {/* MOBILE HEADER (Floating) */}
        <div className="lg:hidden sticky top-4 z-20 w-[90%] flex justify-between items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 bg-white rounded-2xl shadow-xl border border-neutral-200 text-neutral-800"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border flex items-center justify-center gap-3">
            <span className="text-[10px] font-black uppercase text-neutral-400">
              A5 Preview
            </span>
            <div className="h-4 w-[1px] bg-neutral-200" />
            <span className="text-xs font-bold text-neutral-800">
              {recipes.length} pages
            </span>
          </div>
        </div>

        {/* DESKTOP BADGE (Caché sur mobile pour éviter la surcharge) */}
        <div className="hidden lg:flex sticky top-6 z-10 mt-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm border items-center gap-3">
          <Layers size={14} className="text-orange-600" />
          <span className="text-xs font-bold text-neutral-800">
            Format A5 (148 × 210 mm)
          </span>
          <div className="size-2 bg-green-500 rounded-full" />
        </div>

        {/* CONTAINER DE LA PREVIEW : Ajout d'un padding et d'un zoom responsive */}
        <div className="w-full max-w-full overflow-x-auto py-8 lg:py-10 flex justify-center px-4">
          <div className="origin-top scale-[0.85] sm:scale-100 transition-transform">
            {activeRecipe && <RecipePrintView recipe={activeRecipe} />}
          </div>
        </div>
      </main>

      {/* ZONE INVISIBLE PDF (Reste inchangée) */}
      <div className="absolute -left-[9999px] top-0 bg-white">
        <div ref={printContainerRef}>
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="w-[559px] h-[794px] overflow-hidden"
            >
              <RecipePrintView recipe={recipe} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
