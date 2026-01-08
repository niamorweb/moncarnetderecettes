<script setup lang="ts">
import {
  ForkKnife,
  Users,
  ChefHat,
  Timer,
  Search,
  BookOpen,
  ArrowUpRight,
  Sparkles,
} from "lucide-vue-next";

// 1. Paramètres Nuxt & Route
const route = useRoute();
const username = route.params.username as string;
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// 2. Fetch Data
const {
  data: pageData,
  error: fetchError,
  status,
} = await useFetch<any>(`/profiles/public/${username}`, {
  baseURL: apiBase,
  lazy: true,
});

// 3. Gestion 404
watch(
  status,
  (newStatus) => {
    if (newStatus === "error" || (newStatus === "success" && !pageData.value)) {
      showError({
        statusCode: 404,
        statusMessage: "Ce carnet est introuvable ou privé.",
        fatal: true,
      });
    }
  },
  { immediate: true }
);

// 4. Filtrage & Recherche
const selectedCategory = ref<string | null>(null);
const searchQuery = ref("");

const filteredRecipes = computed(() => {
  if (!pageData.value?.recipes) return [];

  let result = pageData.value.recipes;

  // Filtre Catégorie
  if (selectedCategory.value) {
    result = result.filter((r: any) => r.categoryId === selectedCategory.value);
  }

  // Filtre Recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((r: any) =>
      (r.title || r.name).toLowerCase().includes(query)
    );
  }

  return result;
});

// 5. SEO
const displayName = computed(() => pageData.value?.profile?.name || username);
const avatarUrl = computed(
  () =>
    `https://ui-avatars.com/api/?name=${displayName.value}&background=fff7ed&color=ea580c&size=128`
);

useSeoMeta({
  title: () =>
    pageData.value ? `Les recettes de ${displayName.value}` : "Chargement...",
  description: () =>
    `Découvrez le carnet de recettes digital de ${displayName.value}.`,
  ogImage: () =>
    pageData.value?.recipes?.[0]?.image_url || "/images/og-default.jpg",
});

// État pour déclencher l'animation d'entrée CSS
const isMounted = ref(false);
onMounted(() => {
  setTimeout(() => (isMounted.value = true), 100);
});
</script>

<template>
  <div
    class="min-h-screen bg-[#FAFAFA] text-neutral-900 font-sans selection:bg-orange-100 selection:text-orange-900"
  >
    <nav class="z-40 px-6 py-4 pointer-events-none">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div
          class="bg-white/80 backdrop-blur-md border border-white/40 shadow-sm md:px-4 p-2 rounded-full pointer-events-auto flex items-center gap-2"
        >
          <BookOpen :size="16" class="text-orange-600" />
          <span class="text-xs font-bold hidden md:block text-neutral-900"
            >MonCarnetDeRecettes</span
          >
        </div>

        <UiButton size="sm" variant="primary" to="/signup">
          Créer mon carnet
          <ArrowUpRight :size="14" />
        </UiButton>
      </div>
    </nav>

    <div
      v-if="status === 'pending'"
      class="max-w-7xl mx-auto px-6 pt-16 z-0 relative animate-pulse"
    >
      <div class="flex flex-col items-center gap-6 mb-20">
        <div class="size-24 rounded-full bg-neutral-200"></div>
        <div class="h-10 w-64 bg-neutral-200 rounded-xl"></div>
        <div class="h-4 w-96 bg-neutral-200 rounded-lg"></div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="i in 8"
          :key="i"
          class="aspect-[4/5] bg-neutral-200 rounded-[2rem]"
        ></div>
      </div>
    </div>

    <div
      v-else-if="pageData"
      class="pt-16 pb-20 px-6 max-w-7xl mx-auto relative"
    >
      <div
        class="fixed top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[600px] bg-gradient-to-b from-orange-50/50 to-transparent pointer-events-none -z-10"
      ></div>

      <header class="flex flex-col items-center text-center mb-16 relative">
        <div class="relative mb-6 group">
          <div
            class="absolute inset-0 bg-orange-200 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-700"
          ></div>
          <div
            class="relative size-24 md:size-28 rounded-full border-[3px] border-white shadow-xl overflow-hidden bg-orange-50"
          >
            <img
              :src="avatarUrl"
              alt="Avatar"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full border border-neutral-100 shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles :size="12" class="text-orange-500 fill-orange-500" />
            <span
              class="text-[10px] font-black uppercase tracking-wider text-neutral-600"
              >Premium Chef</span
            >
          </div>
        </div>

        <h1
          class="text-4xl md:text-6xl font-black text-neutral-900 tracking-tighter mb-4"
        >
          La cuisine de
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600"
            >{{ displayName }}</span
          >.
        </h1>

        <p
          class="text-lg md:text-xl text-neutral-500 font-medium max-w-2xl leading-relaxed"
        >
          {{
            pageData.profile?.bio ||
            "Une collection personnelle de recettes savoureuses, testées et approuvées."
          }}
        </p>

        <div class="mt-8 flex gap-8 text-neutral-400">
          <div class="text-center">
            <span class="block text-xl font-black text-neutral-900">{{
              pageData.recipes.length
            }}</span>
            <span class="text-xs font-bold uppercase tracking-wide"
              >Recettes</span
            >
          </div>
          <div class="text-center border-l border-neutral-200 pl-8">
            <span class="block text-xl font-black text-neutral-900">{{
              pageData.categories.length
            }}</span>
            <span class="text-xs font-bold uppercase tracking-wide"
              >Catégories</span
            >
          </div>
        </div>
      </header>

      <div
        class="sticky top-20 z-30 mb-10 transition-all duration-300"
        :class="{ 'py-2': true }"
      >
        <div
          class="bg-white/80 backdrop-blur-xl border border-white/50 p-2 pl-4 rounded-[2rem] shadow-xl shadow-neutral-200/40 flex flex-col md:flex-row items-center gap-4 max-w-4xl mx-auto"
        >
          <div
            class="flex-1 w-full overflow-x-auto no-scrollbar flex items-center gap-2 pr-4"
          >
            <button
              @click="selectedCategory = null"
              class="shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all duration-300"
              :class="
                !selectedCategory
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'text-neutral-500 hover:bg-neutral-100'
              "
            >
              Tout
            </button>
            <button
              v-for="cat in pageData.categories"
              :key="cat.id"
              @click="selectedCategory = cat.id"
              class="shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all duration-300 border border-transparent"
              :class="
                selectedCategory === cat.id
                  ? 'bg-orange-100 text-orange-700 border-orange-200'
                  : 'text-neutral-500 hover:bg-neutral-100'
              "
            >
              {{ cat.name }}
            </button>
          </div>

          <div class="w-full md:w-64 relative shrink-0">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 size-4"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Chercher un plat..."
              class="w-full pl-10 pr-4 py-2.5 bg-neutral-100 rounded-full text-sm font-bold border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-200 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <TransitionGroup
        tag="div"
        name="recipe-grid"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]"
      >
        <NuxtLink
          v-for="(recipe, index) in filteredRecipes"
          :key="recipe.id"
          :to="`/u/${username}/recipe/${recipe.id}`"
          class="group relative bg-white rounded-[2.5rem] p-3 shadow-sm border border-neutral-100 hover:shadow-2xl hover:border-orange-100 hover:-translate-y-1 transition-all duration-500"
          :style="{
            '--delay': `${
              // @ts-ignore
              index * 50
            }ms`,
          }"
        >
          <div
            class="aspect-[4/3] rounded-[2rem] overflow-hidden bg-neutral-100 relative"
          >
            <NuxtImg
              :src="recipe.image_url || '/images/placeholder-recipe.jpg'"
              :alt="recipe.title"
              class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>

            <div
              v-if="recipe.category"
              class="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-neutral-800 shadow-sm z-10"
            >
              {{ recipe.category?.name }}
            </div>
          </div>

          <div class="px-2 pt-4 pb-2">
            <h3
              class="text-lg font-black text-neutral-900 mb-3 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2"
            >
              {{ recipe.title || recipe.name }}
            </h3>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="flex items-center gap-1.5 text-xs font-bold text-neutral-500 bg-neutral-50 px-2 py-1 rounded-lg"
                >
                  <Timer class="size-3.5 text-orange-500" />
                  {{ (recipe.prep_time || 0) + (recipe.cook_time || 0) }}'
                </div>
                <div
                  v-if="recipe.servings"
                  class="flex items-center gap-1.5 text-xs font-bold text-neutral-500 bg-neutral-50 px-2 py-1 rounded-lg"
                >
                  <Users class="size-3.5 text-orange-500" />
                  {{ recipe.servings }}
                </div>
              </div>

              <div
                class="size-8 rounded-full bg-neutral-900 text-white flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
              >
                <ArrowUpRight :size="16" />
              </div>
            </div>
          </div>
        </NuxtLink>
      </TransitionGroup>

      <div
        v-if="filteredRecipes.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center animate-fade-in"
      >
        <div
          class="bg-white p-6 rounded-[2rem] shadow-lg border border-neutral-100 mb-6 rotate-3"
        >
          <div class="text-6xl">🍳</div>
        </div>
        <h3 class="text-2xl font-black text-neutral-900 mb-2">
          Aucune recette trouvée
        </h3>
        <p class="text-neutral-500">
          Essayez de changer de catégorie ou de recherche.
        </p>
        <button
          @click="
            selectedCategory = null;
            searchQuery = '';
          "
          class="mt-6 text-orange-600 font-bold hover:underline"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* MOTION DESIGN (TransitionGroup) */

/* 1. Animation d'entrée initiale et liste */
.recipe-grid-enter-active,
.recipe-grid-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}

.recipe-grid-enter-from,
.recipe-grid-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

/* 2. Le "Move" : Permet aux éléments de glisser fluidement quand un voisin disparaît */
.recipe-grid-move {
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

/* 3. Absolute position pour leave : évite le saut brusque lors de la suppression */
.recipe-grid-leave-active {
  position: absolute;
  /* Note: Cela peut casser la layout grid parfois, si c'est le cas, retirer absolute */
}

/* Stagger effect via CSS delay var */
.recipe-grid-enter-active {
  transition-delay: var(--delay);
}

/* Simple fade in */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
</style>
