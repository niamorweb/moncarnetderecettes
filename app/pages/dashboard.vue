<script setup lang="ts">
import {
  BookType,
  ChefHat,
  Loader2,
  Move,
  Plus,
  PlusCircle,
  Trash,
  User,
  X,
} from "lucide-vue-next";

import type { Recipe } from "~/types/models/recipe";

import type { Category } from "~/types/models/category";

const authStore = useAuthStore();

if (!authStore.isAuthenticated) {
  await navigateTo("/login");
}

const recipes = ref<Recipe[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(true);
const isSubmittingCategory = ref(false);

const loadDashboardData = async () => {
  loading.value = true;

  try {
    const [recipesData, categoriesData] = await Promise.all([
      $api<Recipe[]>("/recipes/all"),

      $api<Category[]>("/categories"),
    ]);

    recipes.value = recipesData || [];
    categories.value = categoriesData || [];
  } catch (err) {
    console.error("Erreur chargement dashboard:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDashboardData();
});

const isVisible = ref(false);
const selectedRecipes = ref<string[]>([]);
const isPickerModalOpen = ref(false);
const selectedCategory = ref<string | null>(null);
const isAddingCategory = ref(false);
const newCategoryName = ref("");
const isMoveMenuOpen = ref(false);

const modalConfig = reactive({
  isOpen: false,
  type: null as "recipe" | "category" | null,
  data: null as string | null,
  title: "",
  description: "",
});

onMounted(() => {
  isVisible.value = true;
});

const filteredRecipes = computed(() => {
  if (!recipes.value) return [];

  return recipes.value.filter(
    (x) => !selectedCategory.value || selectedCategory.value === x.categoryId
  );
});

const handleAddCategory = async () => {
  if (!newCategoryName.value.trim()) return;

  isSubmittingCategory.value = true;

  try {
    await $api<Category>("/categories", {
      method: "POST",
      body: { name: newCategoryName.value },
    });

    newCategoryName.value = "";
    isAddingCategory.value = false;
    await loadDashboardData();
  } catch (err) {
    console.error("Erreur lors de l'ajout de la catégorie", err);
  } finally {
    isSubmittingCategory.value = false;
  }
};

const handleToggleSelectedRecipe = (id: string) => {
  if (selectedRecipes.value.includes(id)) {
    selectedRecipes.value = selectedRecipes.value.filter((x) => x !== id);
  } else {
    selectedRecipes.value.push(id);
  }
};

const handleMoveToCategory = async (categoryId: string | null) => {
  try {
    await $api("/recipes/bulk-move", {
      method: "PATCH",
      body: {
        recipeIds: selectedRecipes.value,
        categoryId: categoryId,
      },
    });

    selectedRecipes.value = [];
    isMoveMenuOpen.value = false;
    await loadDashboardData();
  } catch (err) {
    console.error("Erreur lors du déplacement", err);
  }
};

const handleDeleteSelected = async () => {
  try {
    await $api("/recipes/bulk-delete", {
      method: "DELETE",
      body: { ids: selectedRecipes.value },
    });

    selectedRecipes.value = [];
    await loadDashboardData();
  } catch (err) {
    console.error("Erreur lors de la suppression", err);
  }
};

const handleDeleteCategory = async (categoryId: string) => {
  try {
    await $api(`/categories/${categoryId}`, {
      method: "DELETE",
    });

    if (selectedCategory.value === categoryId) selectedCategory.value = null;

    await loadDashboardData();
  } catch (err) {
    console.error("Erreur lors de la suppression de la catégorie", err);
  }
};

const openDeleteModal = (
  type: "recipe" | "category",
  id: string | null = null,
  name: string = ""
) => {
  modalConfig.isOpen = true;
  modalConfig.type = type;
  modalConfig.data = id;
  modalConfig.title = type === "recipe" ? "Supprimer ?" : `Supprimer ${name} ?`;
  modalConfig.description =
    type === "recipe"
      ? "Supprimer les recettes sélectionnées ?"
      : "La catégorie sera supprimée, mais les recettes seront conservées.";
};
</script>

<template>
  <div class="min-h-screen flex items-start bg-neutral-50">
    <div to="body">
      <div
        v-if="isPickerModalOpen"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
          @click="isPickerModalOpen = false"
        />

        <div
          class="relative bg-neutral-50 rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div class="p-6 bg-white border-b flex justify-between items-center">
            <h2 class="text-2xl font-bold">Piocher des recettes</h2>

            <div class="flex gap-3">
              <button
                @click="
                  handleMoveToCategory(selectedCategory);

                  isPickerModalOpen = false;
                "
                class="px-6 py-2.5 bg-neutral-900 text-white font-bold rounded-xl"
              >
                Confirmer
              </button>

              <button
                @click="isPickerModalOpen = false"
                class="p-2 text-neutral-400"
              >
                <X />
              </button>
            </div>
          </div>

          <div
            class="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div
              v-for="recipe in recipes.filter(
                (r) => r.categoryId !== selectedCategory
              )"
              :key="recipe.id"
              @click="handleToggleSelectedRecipe(recipe.id)"
              :class="[
                'flex items-center gap-4 p-3 border-2 rounded-2xl cursor-pointer transition-all',

                selectedRecipes.includes(recipe.id)
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-white bg-white',
              ]"
            >
              <NuxtImg
                :src="recipe.image_url || '/placeholder.jpg'"
                class="size-16 rounded-xl object-cover aspect-square"
              />

              <h4 class="font-bold truncate">{{ recipe.name }}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmationModal
      :is-open="modalConfig.isOpen"
      :title="modalConfig.title"
      :description="modalConfig.description"
      @close="modalConfig.isOpen = false"
      @confirm="
        () => {
          if (modalConfig.type === 'recipe') handleDeleteSelected();

          if (modalConfig.type === 'category' && modalConfig.data)
            handleDeleteCategory(modalConfig.data);

          modalConfig.isOpen = false;
        }
      "
    />

    <div name="fade-up">
      <div
        v-if="selectedRecipes.length > 0"
        class="fixed bg-white p-3 border border-neutral-200 rounded-2xl z-[60] left-1/2 -translate-x-1/2 bottom-6 shadow-2xl flex items-center gap-3"
      >
        <div class="relative">
          <button
            @click="isMoveMenuOpen = !isMoveMenuOpen"
            class="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-orange-50 text-orange-700 font-bold"
          >
            <Move :size="16" /> Déplacer
          </button>

          <div
            v-if="isMoveMenuOpen"
            class="absolute left-0 bottom-full mb-3 bg-white border border-neutral-200 shadow-xl rounded-2xl p-2 min-w-[200px]"
          >
            <button
              @click="handleMoveToCategory(null)"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50 text-sm"
            >
              Aucune
            </button>

            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="handleMoveToCategory(cat.id)"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50 text-sm"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <button
          @click="openDeleteModal('recipe')"
          class="px-4 py-1.5 text-red-600 font-bold hover:bg-red-50 rounded-md"
        >
          <Trash :size="16" />
        </button>

        <button
          @click="selectedRecipes = []"
          class="px-4 p-1.5 text-neutral-400 hover:bg-neutral-100 rounded-md"
        >
          <X />
        </button>
      </div>
    </div>

    <div class="p-6 md:p-12 max-w-7xl w-full mx-auto">
      <div class="flex justify-between items-center mb-12">
        <UiButton size="sm" to="/account" variant="outline"
          ><User :size="20" /> Mon compte</UiButton
        >

        <UiButton
          v-if="recipes.length"
          size="sm"
          to="/pdf-viewer"
          variant="secondary"
        >
          <BookType :size="20" /> Voir mon livre
        </UiButton>
      </div>

      <div
        :class="[
          'mb-10 transition-all duration-700',

          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4',
        ]"
      >
        <h1
          class="text-4xl md:text-5xl font-black text-neutral-900 mb-2 tracking-tight"
        >
          Mon Carnet
        </h1>

        <p class="text-neutral-500 text-lg font-medium">
          Créez et organisez vos recettes.
        </p>
      </div>

      <div
        class="flex flex-col md:flex-row items-center justify-between gap-6 mb-12"
      >
        <div class="overflow-auto w-full md:w-auto">
          <div class="flex flex-nowrap items-center gap-2 py-2 pr-3">
            <button
              @click="selectedCategory = null"
              :class="[
                'px-5 py-2 rounded-full text-sm font-bold transition-all',

                !selectedCategory
                  ? 'bg-neutral-900 text-white shadow-lg'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100',
              ]"
            >
              Toutes
            </button>

            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectedCategory = cat.id"
              :class="[
                'group relative flex items-center h-10 px-5 rounded-full text-sm font-bold border transition-all',

                selectedCategory === cat.id
                  ? 'bg-neutral-900 text-white pr-12'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100',
              ]"
            >
              <span>{{ cat.name }}</span>

              <span
                v-if="selectedCategory === cat.id"
                @click.stop="openDeleteModal('category', cat.id, cat.name)"
                class="absolute right-0 h-full w-10 bg-white/10 hover:bg-red-500 flex items-center justify-center rounded-r-full"
              >
                <Trash :size="14" />
              </span>
            </button>

            <form
              v-if="isAddingCategory"
              @submit.prevent="handleAddCategory"
              class="relative flex items-center"
            >
              <input
                v-model="newCategoryName"
                autofocus
                :disabled="isSubmittingCategory"
                @blur="
                  !newCategoryName &&
                    !isSubmittingCategory &&
                    (isAddingCategory = false)
                "
                class="bg-white border-2 border-orange-400 pl-4 pr-9 py-2 rounded-full text-sm outline-none transition-all disabled:bg-neutral-50 disabled:text-neutral-400"
                :class="isSubmittingCategory ? 'cursor-wait' : ''"
                placeholder="Nom..."
              />

              <div
                v-if="isSubmittingCategory"
                class="absolute right-3 flex items-center justify-center"
              >
                <Loader2 :size="16" class="animate-spin text-orange-500" />
              </div>
            </form>

            <UiButton
              v-else
              :is-icon="true"
              variant="secondary"
              class="aspect-square size-10 !p-0 !rounded-full"
              @click="isAddingCategory = true"
            >
              <Plus :size="20" />
            </UiButton>
          </div>
        </div>

        <div
          :class="[
            'fixed bottom-5 right-5 md:bottom-0 md:right-0 md:relative z-20',

            selectedRecipes.length > 0 ? 'hidden md:block' : '',
          ]"
        >
          <UiButton to="/new-recipe">
            <Plus :size="12" /> Nouvelle recette
          </UiButton>
        </div>
      </div>

      <div
        v-if="!recipes.length"
        class="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-neutral-200"
      >
        <div class="text-7xl mb-6">🍳</div>

        <h3 class="text-2xl font-black mb-2">Votre carnet est vide</h3>

        <UiButton to="/new-recipe" size="lg" class="mt-6">
          Ajouter ma première recette →
        </UiButton>
      </div>

      <div
        v-else-if="!filteredRecipes.length"
        class="bg-white border border-neutral-200 rounded-[3rem] p-12 text-center"
      >
        <ChefHat :size="40" class="mx-auto text-neutral-300 mb-6" />

        <h3 class="text-3xl font-black mb-3">Cette catégorie est vide</h3>

        <div class="flex gap-4 justify-center mt-8">
          <UiButton variant="outline" @click="isPickerModalOpen = true"
            >Piocher des recettes</UiButton
          >

          <UiButton :to="`/new-recipe?category=${selectedCategory}`"
            ><PlusCircle :size="18" /> Créer ici</UiButton
          >
        </div>
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <DashboardRecipeCard
          v-for="(recipe, index) in filteredRecipes"
          :key="recipe.id"
          :recipe="recipe"
          :index="index"
          :is-selected="selectedRecipes.includes(recipe.id)"
          :is-any-selected="selectedRecipes.length > 0"
          @toggle="handleToggleSelectedRecipe"
        />

        <NuxtLink
          :to="`/new-recipe${
            selectedCategory ? '?category=' + selectedCategory : ''
          }`"
          class="group aspect-square flex flex-col items-center justify-center gap-4 border-2 border-dashed border-neutral-200 rounded-[2rem] hover:border-orange-400 hover:bg-orange-50 transition-all"
        >
          <div
            class="p-4 bg-neutral-100 group-hover:bg-orange-100 rounded-full"
          >
            <Plus
              class="size-8 text-neutral-400 group-hover:rotate-90 transition-transform"
            />
          </div>

          <span
            class="font-black uppercase tracking-widest text-xs text-neutral-400"
            >Nouvelle recette</span
          >
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
