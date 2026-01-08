<script setup lang="ts">
import {
  ChevronLeft,
  Utensils,
  ChefHat,
  Clock,
  Users,
  Printer,
  Share2,
  Check,
  BookOpen,
} from "lucide-vue-next";
import type { Recipe } from "~/types/models/recipe";

const route = useRoute();
const username = route.params.username as string;
const recipeId = route.params.id as string;
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

const {
  data: recipe,
  error: fetchError,
  status,
} = await useFetch<Recipe>(`/profiles/public/${username}/recipe/${recipeId}`, {
  baseURL: apiBase,
  lazy: true,
});

watch(
  status,
  (newStatus) => {
    if (newStatus === "error" || (newStatus === "success" && !recipe.value)) {
      showError({
        statusCode: 404,
        statusMessage: "Cette recette semble avoir disparu du menu.",
        fatal: true,
      });
    }
  },
  { immediate: true }
);

const checkedIngredients = ref<Set<number>>(new Set());
const toggleIngredient = (index: number) => {
  if (checkedIngredients.value.has(index)) {
    checkedIngredients.value.delete(index);
  } else {
    checkedIngredients.value.add(index);
  }
};

useSeoMeta({
  title: () =>
    recipe.value
      ? `${recipe.value.name} - Recette de @${username}`
      : "Chargement...",
  description: () =>
    recipe.value
      ? `Apprenez à cuisiner ${recipe.value.name}. Temps: ${recipe.value.prep_time}m.`
      : "",
  ogImage: () => recipe.value?.image_url || "/images/og-default.jpg",
});
</script>

<template>
  <div
    class="min-h-screen bg-[#FAFAFA] font-sans selection:bg-orange-100 selection:text-orange-900 pb-20"
  >
    <nav class="sticky top-0 z-40 w-full px-4 py-4 pointer-events-none">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex pointer-events-auto">
          <UiButton variant="ghost" :to="`/u/${username}`">
            <ChevronLeft :size="16" />
            Retour au carnet
          </UiButton>
        </div>
      </div>
    </nav>

    <div
      v-if="status === 'pending'"
      class="max-w-7xl mx-auto px-6 mt-8 animate-pulse"
    >
      <div class="grid lg:grid-cols-12 gap-12">
        <div class="lg:col-span-5 space-y-8">
          <div class="aspect-[4/3] bg-neutral-200 rounded-[2.5rem]"></div>
          <div class="h-12 w-3/4 bg-neutral-200 rounded-xl"></div>
          <div class="flex gap-4">
            <div class="h-20 flex-1 bg-neutral-200 rounded-2xl"></div>
            <div class="h-20 flex-1 bg-neutral-200 rounded-2xl"></div>
            <div class="h-20 flex-1 bg-neutral-200 rounded-2xl"></div>
          </div>
        </div>
        <div class="lg:col-span-7 space-y-8 mt-20">
          <div class="h-8 w-40 bg-neutral-200 rounded-xl"></div>
          <div class="space-y-4">
            <div
              v-for="i in 6"
              :key="i"
              class="h-16 bg-neutral-200 rounded-2xl"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="recipe" class="max-w-7xl mx-auto px-6 mt-4 md:mt-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        <div
          class="lg:col-span-5 lg:sticky lg:top-24 space-y-8 animate-fade-in-up"
        >
          <div class="relative group">
            <div
              class="absolute inset-0 bg-orange-200 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full"
            ></div>
            <div
              class="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/50"
            >
              <NuxtImg
                :src="recipe.image_url || '/images/placeholder-recipe.jpg'"
                :alt="recipe.name"
                class="object-cover w-full h-full transform transition-transform duration-1000 hover:scale-105"
                placeholder
              />
              <div
                v-if="recipe.category"
                class="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-neutral-900 shadow-sm"
              >
                {{ recipe.category.name }}
              </div>
            </div>
          </div>

          <div>
            <h1
              class="text-4xl md:text-5xl font-black text-neutral-900 leading-[1.1] mb-6 tracking-tight"
            >
              {{ recipe.name }}
            </h1>

            <div class="grid grid-cols-3 gap-3">
              <div
                class="bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm flex flex-col items-center justify-center gap-1"
              >
                <Clock class="size-5 text-neutral-400 mb-1" />
                <span class="text-lg font-black text-neutral-900"
                  >{{ recipe.prep_time || 0 }}m</span
                >
                <span
                  class="text-[10px] uppercase font-bold text-neutral-400 tracking-wide"
                  >Prép.</span
                >
              </div>

              <div
                class="bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm flex flex-col items-center justify-center gap-1"
              >
                <ChefHat class="size-5 text-neutral-400 mb-1" />
                <span class="text-lg font-black text-neutral-900"
                  >{{ recipe.cook_time || 0 }}m</span
                >
                <span
                  class="text-[10px] uppercase font-bold text-neutral-400 tracking-wide"
                  >Cuisson</span
                >
              </div>

              <div
                class="bg-neutral-900 p-4 rounded-3xl shadow-lg shadow-neutral-900/20 flex flex-col items-center justify-center gap-1 text-white"
              >
                <Users class="size-5 text-orange-400 mb-1" />
                <span class="text-lg font-black">{{
                  recipe.servings || 2
                }}</span>
                <span
                  class="text-[10px] uppercase font-bold text-neutral-400 tracking-wide"
                  >Pers.</span
                >
              </div>
            </div>
          </div>
        </div>

        <div
          class="lg:col-span-7 space-y-12 lg:pt-8 animate-fade-in-up"
          style="animation-delay: 100ms"
        >
          <section>
            <div class="flex items-center gap-4 mb-8">
              <div class="bg-orange-100 p-3 rounded-2xl text-orange-600">
                <Utensils class="size-6" />
              </div>
              <h2 class="text-3xl font-black text-neutral-900 tracking-tight">
                Ingrédients
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                v-for="(ing, index) in recipe.ingredients"
                :key="index"
                @click="toggleIngredient(index)"
                class="group flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden"
                :class="
                  checkedIngredients.has(index)
                    ? 'bg-neutral-50 border-neutral-100 opacity-60'
                    : 'bg-white border-neutral-100 hover:border-orange-200 hover:shadow-lg'
                "
              >
                <div
                  class="size-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors"
                  :class="
                    checkedIngredients.has(index)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-neutral-200 group-hover:border-orange-400'
                  "
                >
                  <Check
                    v-if="checkedIngredients.has(index)"
                    :size="14"
                    stroke-width="4"
                  />
                </div>

                <span
                  class="font-bold text-neutral-700 transition-all"
                  :class="{
                    'line-through text-neutral-400':
                      checkedIngredients.has(index),
                  }"
                >
                  {{ ing }}
                </span>
              </button>
            </div>

            <p
              class="mt-4 text-xs font-bold text-neutral-400 text-center uppercase tracking-widest"
            >
              Astuce : Cliquez pour cocher
            </p>
          </section>

          <hr class="border-neutral-100" />

          <section>
            <div class="flex items-center gap-4 mb-10">
              <div class="bg-neutral-100 p-3 rounded-2xl text-neutral-600">
                <BookOpen class="size-6" />
              </div>
              <h2 class="text-3xl font-black text-neutral-900 tracking-tight">
                Préparation
              </h2>
            </div>

            <div class="space-y-0 relative">
              <div
                class="absolute left-[23px] top-8 bottom-8 w-0.5 bg-neutral-100 -z-10"
              ></div>

              <div
                v-for="(step, index) in recipe.steps"
                :key="index"
                class="group flex gap-8 pb-12 last:pb-0"
              >
                <div class="relative shrink-0">
                  <div
                    class="size-12 bg-white border-4 border-[#FAFAFA] rounded-2xl flex items-center justify-center text-lg font-black text-neutral-900 shadow-sm group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 z-10"
                  >
                    {{ index + 1 }}
                  </div>
                </div>

                <div class="pt-2">
                  <p
                    class="text-lg text-neutral-600 font-medium leading-relaxed group-hover:text-neutral-900 transition-colors"
                  >
                    {{ step }}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}
</style>
