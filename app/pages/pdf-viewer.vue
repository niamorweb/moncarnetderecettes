<script setup lang="ts">
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
  Book,
  BookText,
} from "lucide-vue-next";
import draggable from "vuedraggable";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Category } from "~/types/models/category";
import type { Recipe } from "~/types/models/recipe";

const { $api } = useNuxtApp() as any;
const authStore = useAuthStore();

const auth = useAuthStore();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

const recipes = ref<Recipe[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(true);
const isOrderModalOpen = ref(false);

const loadDashboardData = async () => {
  try {
    const [recipesData, categoriesData] = await Promise.all([
      $fetch<Recipe[]>("/recipes/all", {
        baseURL: apiBase,
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        credentials: "include",
      }),
      $fetch<Category[]>("/categories", {
        baseURL: apiBase,
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        credentials: "include",
      }),
    ]);

    recipes.value = recipesData ?? [];
    categories.value = categoriesData ?? [];
    activeRecipe.value ??= recipes.value[0] ?? null;
  } catch (error) {
    console.error("Dashboard load error", error);
  }
};

onMounted(() => {
  loadDashboardData();
  console.log("ath ;", auth.accessToken);
  console.log("ath2 ;", authStore.user);
});

const activeRecipe = ref<Recipe | null>(recipes.value[0] || null);
const searchTerm = ref("");
const isGenerating = ref(false);
const isSidebarOpen = ref(false);
const printContainerRef = ref<HTMLElement | null>(null);

const move = (index: number, direction: number) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= recipes.value.length) return;
  const items = [...recipes.value];
  const [removed] = items.splice(index, 1);
  // @ts-ignore
  items.splice(newIndex, 0, removed);
  recipes.value = items;
};

const filteredRecipes = computed(() => {
  return recipes.value.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const generatePDF = async () => {
  if (!printContainerRef.value) return;
  isGenerating.value = true;

  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
    });

    const elements = printContainerRef.value.children;
    for (let i = 0; i < elements.length; i++) {
      const canvas = await html2canvas(elements[i] as HTMLElement, {
        scale: 2,
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
    console.error("Erreur PDF:", err);
  } finally {
    isGenerating.value = false;
  }
};
</script>

<template>
  <div class="flex h-screen bg-neutral-100 overflow-hidden font-sans relative">
    <Transition name="fade">
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
        @click="isSidebarOpen = false"
      />
    </Transition>

    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-40 w-[85%] sm:w-[350px] bg-neutral-100 border-r border-neutral-200 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="p-4 border-b border-neutral-200 bg-white lg:bg-transparent">
        <div class="flex justify-between items-center lg:block">
          <UiButton
            to="/dashboard"
            variant="ghost"
            size="sm"
            class="px-0 hover:bg-transparent"
          >
            <ChevronLeft :size="18" /> Dashboard
          </UiButton>
          <button @click="isSidebarOpen = false" class="lg:hidden p-2">
            <X :size="24" />
          </button>
        </div>

        <h2
          class="text-lg font-black text-neutral-900 flex items-center gap-2 mt-6 mb-4"
        >
          <Layers :size="18" class="text-orange-600" /> Ordre des Pages
        </h2>

        <div class="relative">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            :size="14"
          />
          <input
            v-model="searchTerm"
            class="w-full pl-9 pr-4 py-2 bg-white lg:bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder="Chercher une recette..."
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-3">
        <draggable
          v-model="recipes"
          item-key="id"
          handle=".drag-handle"
          class="space-y-2"
          ghost-class="opacity-50"
        >
          <template #item="{ element: recipe, index }">
            <div class="flex items-center gap-2 group">
              <div
                class="hidden lg:block text-neutral-300 hover:text-neutral-600 cursor-grab drag-handle"
              >
                <GripVertical :size="20" />
              </div>

              <button
                @click="
                  activeRecipe = recipe;
                  // @ts-ignore
                  if (typeof window !== 'undefined' && window.innerWidth < 1024)
                    isSidebarOpen = false;
                "
                :class="[
                  'flex-1 flex items-center gap-3 p-2 rounded-xl border-2 transition-all text-left',
                  activeRecipe?.id === recipe.id
                    ? 'bg-orange-50 border-orange-200 shadow-sm'
                    : 'bg-white border-transparent shadow-sm',
                ]"
              >
                <div
                  class="relative size-10 shrink-0 rounded-lg overflow-hidden border border-neutral-100"
                >
                  <NuxtImg
                    :src="recipe.image_url || '/placeholder.jpg'"
                    class="object-cover w-full h-full"
                    loading="lazy"
                  />
                </div>
                <span
                  :class="[
                    'text-xs font-bold line-clamp-2',
                    activeRecipe?.id === recipe.id
                      ? 'text-orange-700'
                      : 'text-neutral-700',
                  ]"
                >
                  {{ recipe.name }}
                </span>
              </button>

              <div class="flex flex-col gap-1">
                <button
                  @click="move(index, -1)"
                  :disabled="index === 0"
                  class="p-1 rounded bg-white border border-neutral-200 disabled:opacity-30"
                >
                  <ChevronUp :size="14" />
                </button>
                <button
                  @click="move(index, 1)"
                  :disabled="index === recipes.length - 1"
                  class="p-1 rounded bg-white border border-neutral-200 disabled:opacity-30"
                >
                  <ChevronDown :size="14" />
                </button>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <div class="p-4 flex flex-col gap-3 border-t border-neutral-200 bg-white">
        <UiButton
          variant="outline"
          @click="generatePDF"
          :disabled="isGenerating || recipes.length === 0"
          class="w-full"
        >
          <Loader2 v-if="isGenerating" class="animate-spin" :size="18" />
          <Download v-else :size="18" />
          {{ isGenerating ? "Création..." : "Télécharger PDF" }}
        </UiButton>

        <UiButton @click="isOrderModalOpen = true" class="w-full" size="lg">
          <BookTextv-else :size="18" />Commander ce carnet
        </UiButton>
      </div>
    </aside>

    <main
      class="flex-1 overflow-y-auto bg-neutral-200 flex flex-col items-center relative"
    >
      <div
        class="lg:hidden sticky top-4 z-20 w-[90%] flex justify-between items-center gap-2"
      >
        <button
          @click="isSidebarOpen = true"
          class="p-3 bg-white rounded-2xl shadow-xl border border-neutral-200 text-neutral-800"
        >
          <Menu :size="20" />
        </button>
        <div
          class="flex-1 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border flex items-center justify-center gap-3"
        >
          <span class="text-[10px] font-black uppercase text-neutral-400"
            >A5 Preview</span
          >
          <div class="h-4 w-[1px] bg-neutral-200" />
          <span class="text-xs font-bold text-neutral-800"
            >{{ recipes.length }} pages</span
          >
        </div>
      </div>

      <div
        class="hidden lg:flex sticky top-6 z-10 mt-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm border items-center gap-3"
      >
        <Layers :size="14" class="text-orange-600" />
        <span class="text-xs font-bold text-neutral-800"
          >Format A5 (148 × 210 mm)</span
        >
        <div class="size-2 bg-green-500 rounded-full" />
      </div>

      <div
        class="w-full max-w-full overflow-x-auto py-8 lg:py-10 flex justify-center px-4"
      >
        <div class="origin-top scale-[0.85] sm:scale-100 transition-transform">
          <RecipePrint v-if="activeRecipe" :recipe="activeRecipe" />
        </div>
      </div>
    </main>

    <div class="absolute -left-[9999px] top-0 bg-white">
      <div ref="printContainerRef">
        <div
          v-for="recipe in recipes"
          :key="recipe.id"
          class="w-[559px] h-[794px] overflow-hidden"
        >
          <RecipePrint :recipe="recipe" />
        </div>
      </div>
    </div>
    <OrderModal :is-open="isOrderModalOpen" @close="isOrderModalOpen = false" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
