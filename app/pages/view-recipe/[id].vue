<script setup lang="ts">
import { ChevronLeft, Utensils, ChefHat, Pen } from "lucide-vue-next";

import type { Recipe } from "~/types/models/recipe";

const route = useRoute();
const { $api } = useNuxtApp() as any;
const recipeId = route.params.id as string;
const auth = useAuthStore();
const config = useRuntimeConfig();
const modalConfig = reactive({
  isOpen: false,
  type: null as "recipe" | "category" | null,
  data: null as string | null,
  title: "",
  description: "",
});

const { data: recipe, error: fetchError } = await useAsyncData<Recipe>(
  `recipe-view-${recipeId}`,

  () =>
    $fetch<Recipe>(`/recipes/${recipeId}`, {
      method: "GET",
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
      credentials: "include",
    })
);

if (fetchError.value || !recipe.value) {
  throw createError({
    statusCode: 404,
    statusMessage:
      "Cette recette semble s'être envolée vers d'autres cuisines.",
    fatal: true,
  });
}

const handleDeleteCategory = async (recipeId: string) => {
  try {
    await $fetch<Recipe>(`/recipes/${recipeId}`, {
      method: "DELETE",
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
      credentials: "include",
    });
    await navigateTo("/dashboard");
  } catch (err) {
    console.error("Erreur lors de la suppression de la catégorie", err);
  }

  modalConfig.isOpen = false;
};

const openDeleteModal = (id: string) => {
  modalConfig.isOpen = true;
  modalConfig.data = id;
  modalConfig.title = "Supprimer cette recette ?";
  modalConfig.description =
    "Cette action est irréversible et supprimera définitivement la recette.";
};
</script>

<template>
  <div>
    <ConfirmationModal
      :is-open="modalConfig.isOpen"
      :title="modalConfig.title"
      :description="modalConfig.description"
      @close="modalConfig.isOpen = false"
      @confirm="modalConfig.data && handleDeleteCategory(modalConfig.data)"
    />

    <div v-if="recipe" class="min-h-screen bg-neutral-50 py-12 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="mb-10 flex items-center justify-between">
          <UiButton size="sm" to="/dashboard" variant="ghost">
            <ChevronLeft :size="14" /> Dashboard
          </UiButton>

          <div class="flex items-center gap-2">
            <UiButton @click="openDeleteModal(recipe.id)" variant="destructive">
              <Pen :size="12" />

              <span>Supprimer</span>
            </UiButton>

            <UiButton :to="`/edit-recipe/${recipe.id}`" variant="primary">
              <Pen :size="12" />

              <span>Modifier</span>
            </UiButton>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-5">
            <div
              class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-neutral-100 lg:sticky lg:top-12"
            >
              <div
                class="relative aspect-[4/3] overflow-hidden rounded-3xl mb-8 bg-neutral-100 shadow-inner"
              >
                <NuxtImg
                  :src="recipe.image_url || '/images/illustration.jpeg'"
                  :alt="recipe.name"
                  class="object-cover w-full h-full"
                  loading="eager"
                />
              </div>

              <h1
                class="text-4xl font-black text-neutral-900 mb-8 leading-tight tracking-tight"
              >
                {{ recipe.name }}
              </h1>

              <div class="grid grid-cols-3 gap-4">
                <div
                  class="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-center"
                >
                  <div class="text-lg font-black text-neutral-900">
                    {{ recipe.prep_time || 0 }}m
                  </div>

                  <div
                    class="text-[10px] uppercase font-black tracking-widest text-neutral-400 mt-1"
                  >
                    Prép.
                  </div>
                </div>

                <div
                  class="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-center"
                >
                  <div class="text-lg font-black text-neutral-900">
                    {{ recipe.cook_time || 0 }}m
                  </div>

                  <div
                    class="text-[10px] uppercase font-black tracking-widest text-neutral-400 mt-1"
                  >
                    Cuisson
                  </div>
                </div>

                <div
                  class="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center"
                >
                  <div class="text-lg font-black text-orange-600">
                    {{ recipe.servings || 0 }}
                  </div>

                  <div
                    class="text-[10px] uppercase font-black tracking-widest text-orange-400 mt-1"
                  >
                    Pers.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-7 space-y-8">
            <div
              class="bg-white p-10 rounded-[2.5rem] shadow-sm border border-neutral-100"
            >
              <div
                class="flex items-center gap-3 mb-8 pb-4 border-b border-neutral-100"
              >
                <div class="p-2 bg-orange-100 rounded-lg">
                  <Utensils class="size-5 text-orange-600" />
                </div>

                <h2 class="text-2xl font-black text-neutral-900">
                  Ingrédients
                </h2>
              </div>

              <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li
                  v-for="(ing, index) in recipe.ingredients"
                  :key="index"
                  class="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-transparent hover:border-orange-200 transition-all group"
                >
                  <span
                    class="size-7 bg-white text-neutral-900 text-xs font-black rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                  >
                    {{ index + 1 }}
                  </span>

                  <span
                    class="text-neutral-700 font-bold text-sm leading-relaxed"
                    >{{ ing }}</span
                  >
                </li>
              </ul>
            </div>

            <div
              class="bg-white p-10 rounded-[2.5rem] shadow-sm border border-neutral-100"
            >
              <div
                class="flex items-center gap-3 mb-10 pb-4 border-b border-neutral-100"
              >
                <div class="p-2 bg-orange-100 rounded-lg">
                  <ChefHat class="size-5 text-orange-600" />
                </div>

                <h2 class="text-2xl font-black text-neutral-900">
                  Préparation
                </h2>
              </div>

              <div class="space-y-10">
                <div
                  v-for="(step, index) in recipe.steps"
                  :key="index"
                  class="flex gap-6 group"
                >
                  <div class="flex flex-col items-center">
                    <span
                      class="size-12 bg-neutral-900 text-white font-black rounded-[1.2rem] flex items-center justify-center shrink-0 text-lg shadow-lg"
                    >
                      {{ index + 1 }}
                    </span>

                    <div
                      v-if="index !== recipe.steps.length - 1"
                      class="w-0.5 flex-1 bg-neutral-100 my-2"
                    />
                  </div>

                  <div class="flex-1 pt-1">
                    <p
                      class="text-neutral-700 text-lg leading-relaxed font-medium"
                    >
                      {{ step }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
