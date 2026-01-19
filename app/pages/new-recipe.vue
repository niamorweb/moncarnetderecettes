<script setup lang="ts">
import {
  ChevronLeft,
  Loader2,
  PlusIcon,
  X,
  AlertCircle,
} from "lucide-vue-next";

import type { Category } from "~/types/models/category";

import { z } from "zod";
import type { Recipe } from "~/types/models/recipe";

const router = useRouter();
const route = useRoute();
const categories = ref<Category[]>([]);
const loading = ref(true);
const submitting = ref(false);
const error = ref(null);
const querySource = route.query.source;

const loadDashboardData = async () => {
  try {
    const categoriesData = await $api<Category[]>("/categories");

    categories.value = categoriesData || [];
  } catch (err) {
    console.error("Erreur chargement dashboard:", err);
  } finally {
    loading.value = false;
  }
};

const authStore = useAuthStore();

const imageFile = ref<File | null>(null);
const newCategoryName = ref("");
const fieldErrors = ref<Record<string, string>>({});

const dataFromScan =
  authStore.user.isPremium &&
  querySource &&
  querySource === "scan" &&
  localStorage.getItem("scan-data");
const parsedDataFromScan = dataFromScan && JSON.parse(dataFromScan);

console.log("query :: ", querySource);
console.log("parsedDataFromScan :: ", parsedDataFromScan);

const recipeData = reactive({
  name: parsedDataFromScan ? parsedDataFromScan.nom : "",
  servings: parsedDataFromScan ? parsedDataFromScan.portions : "",
  prep_time: parsedDataFromScan ? parsedDataFromScan.temps_preparation : "",
  cook_time: parsedDataFromScan ? parsedDataFromScan.temps_preparation : "",
  ingredients: parsedDataFromScan ? parsedDataFromScan.ingredients : [""],
  steps: parsedDataFromScan ? parsedDataFromScan.etapes : [""],
  categoryId: (route.query.category as string) || null,
});

const recipeSchema = z.object({
  name: z.string().min(3, "Le nom doit faire au moins 3 caractères"),
  prep_time: z.coerce.number({ message: "Requis" }).min(1, "Temps requis"),
  cook_time: z.coerce.number().optional(),
  servings: z.coerce.number({ message: "Requis" }).min(1, "Au moins 1 pers."),
  ingredients: z
    .array(z.string())
    .transform((arr) => arr.filter((s) => s.trim() !== ""))
    .refine((arr) => arr.length > 0, "Il faut au moins un ingrédient"),
  steps: z
    .array(z.string())
    .transform((arr) => arr.filter((s) => s.trim() !== ""))
    .refine((arr) => arr.length > 0, "Il faut au moins une étape"),
  image: z
    .any() // start with a generic type; we'll validate manually
    .optional()
    .refine(
      (file) => {
        // If the field is omitted, validation passes.
        if (!file) return true;

        const validTypes = [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/webp",
        ];
        return validTypes.includes(file.type);
      },
      { message: "Formats acceptés : .png, .jpeg, .jpg, .webp" },
    )
    .refine(
      (file) => {
        if (!file) return true;

        return file.size <= 5 * 1024 * 1024;
      },
      { message: "L'image ne doit pas dépasser 5 Mo" },
    ),
});

const imagePreview = computed(() => {
  return imageFile.value ? URL.createObjectURL(imageFile.value) : null;
});

const handleAdd = (type: "ingredients" | "steps") => {
  recipeData[type].push("");
};

const handleRemove = (type: "ingredients" | "steps", index: number) => {
  recipeData[type] = recipeData[type].filter(
    (_: Recipe, i: number) => i !== index,
  );

  if (recipeData[type].length === 0) recipeData[type] = [""];
};

const handleImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement;

  if (target.files?.[0]) {
    imageFile.value = target.files[0];

    if (fieldErrors.value.image) delete fieldErrors.value.image;
  }
};

const handleSubmit = async () => {
  fieldErrors.value = {};
  const payloadToValidate = {
    ...recipeData,

    image: imageFile.value,
  };

  const validation = recipeSchema.safeParse(payloadToValidate);

  if (!validation.success) {
    validation.error.issues.forEach((err) => {
      if (err.path[0]) {
        fieldErrors.value[err.path[0].toString()] = err.message;
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    return;
  }

  submitting.value = true;

  try {
    const formData = new FormData();
    formData.append("name", recipeData.name);
    formData.append("servings", recipeData.servings.toString());
    formData.append("prep_time", recipeData.prep_time.toString());
    formData.append("cook_time", recipeData.cook_time.toString());
    formData.append("categoryId", recipeData.categoryId || "");
    formData.append("newCategoryName", newCategoryName.value.trim());

    recipeData.ingredients
      .filter((i: string) => i.trim())
      .forEach((ing: string) => formData.append("ingredients[]", ing));

    recipeData.steps
      .filter((s: string) => s.trim())
      .forEach((step: string) => formData.append("steps[]", step));

    if (imageFile.value) {
      formData.append("image", imageFile.value);
    }

    await $api("/recipes", {
      method: "POST",
      body: formData,
    });

    await router.push("/dashboard");
  } catch (err: any) {
    error.value = err.data?.message || "Erreur lors de la création";
  } finally {
    submitting.value = false;
  }
};

const getInputClass = (fieldName: string) => {
  const base =
    "w-full px-4 py-3 bg-white border rounded-xl focus:outline-none transition-all placeholder:text-neutral-400 ";

  if (fieldErrors.value[fieldName]) {
    return base + "border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/30";
  }

  return base + "border-neutral-200 focus:ring-2 focus:ring-orange-400";
};

onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="min-h-screen bg-neutral-50 py-12 px-4"
  >
    <div class="max-w-7xl mx-auto">
      <UiButton size="sm" to="/dashboard" variant="ghost">
        <ChevronLeft :size="20" /> Retour
      </UiButton>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 md:mb-0 mt-6">
        <div class="lg:col-span-5 space-y-6">
          <UiCard>
            <div
              class="flex flex-col gap-2 md:flex-row md:justify-between md:items-center mb-8"
            >
              <h1 class="text-3xl font-black flex items-center gap-2">
                Nouvelle Recette
              </h1>
              <span
                class="text-xs w-fit font-normal text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full"
              >
                * Champs requis
              </span>
            </div>
            <div class="mb-8">
              <label
                class="flex justify-between text-xs font-black uppercase tracking-widest text-neutral-400 mb-3"
              >
                Photo
              </label>

              <div
                class="relative aspect-video rounded-3xl border-2 border-dashed overflow-hidden transition-colors group"
                :class="
                  fieldErrors.image
                    ? 'border-red-400 bg-red-50'
                    : 'border-neutral-200 bg-neutral-50 hover:border-orange-400'
                "
              >
                <NuxtImg
                  v-if="imagePreview"
                  :src="imagePreview"
                  class="object-cover w-full h-full"
                />

                <div
                  v-else
                  class="flex flex-col items-center justify-center h-full text-neutral-400 font-bold gap-2"
                >
                  <span
                    v-if="fieldErrors.image"
                    class="text-red-500 flex items-center gap-1"
                  >
                    <AlertCircle :size="16" /> {{ fieldErrors.image }}
                  </span>

                  <span v-else>Ajouter une image</span>
                </div>

                <input
                  type="file"
                  accept=".png, .jpeg, .jpg, .webp"
                  @change="handleImageChange"
                  class="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div class="space-y-5">
              <div>
                <label
                  class="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1"
                >
                  Nom de la recette <span class="text-red-500">*</span>
                </label>

                <input
                  v-model="recipeData.name"
                  placeholder="Ex: Tarte Tatin"
                  :class="[getInputClass('name'), 'text-lg font-bold']"
                  @input="delete fieldErrors.name"
                />

                <p
                  v-if="fieldErrors.name"
                  class="text-red-500 text-xs font-bold mt-1 ml-1"
                >
                  {{ fieldErrors.name }}
                </p>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label
                    class="block text-[10px] font-black uppercase text-neutral-400 mb-1"
                  >
                    Prép (min) <span class="text-red-500">*</span>
                  </label>

                  <input
                    v-model="recipeData.prep_time"
                    type="number"
                    :class="getInputClass('prep_time')"
                    @input="delete fieldErrors.prep_time"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label
                    class="block text-[10px] font-black uppercase text-neutral-400 mb-1"
                  >
                    Cuisson (min)
                  </label>

                  <input
                    v-model="recipeData.cook_time"
                    type="number"
                    :class="getInputClass('cook_time')"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label
                    class="block text-[10px] font-black uppercase text-neutral-400 mb-1"
                  >
                    Pers. <span class="text-red-500">*</span>
                  </label>

                  <input
                    v-model="recipeData.servings"
                    type="number"
                    :class="getInputClass('servings')"
                    @input="delete fieldErrors.servings"
                    placeholder="0"
                  />
                </div>
              </div>

              <div
                v-if="fieldErrors.prep_time || fieldErrors.servings"
                class="text-red-500 text-xs font-bold"
              >
                Veuillez remplir les temps et le nombre de personnes.
              </div>

              <div class="pt-2">
                <label
                  class="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-3 ml-1"
                >
                  Catégorie
                </label>

                <select
                  v-model="recipeData.categoryId"
                  class="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option :value="null">Aucune catégorie</option>

                  <option
                    v-for="cat in categories"
                    :key="cat.id"
                    :value="cat.id"
                  >
                    {{ cat.name }}
                  </option>
                </select>

                <div class="w-full h-fit relative mt-3">
                  <input
                    v-model="newCategoryName"
                    placeholder="Ou créer une nouvelle..."
                    class="w-full px-4 py-2 text-sm text-orange-700 bg-orange-50 border border-orange-300 rounded-lg outline-none focus:ring-1 focus:ring-orange-400 placeholder:text-orange-300"
                  />

                  <PlusIcon
                    class="size-5 absolute text-orange-600 top-1/2 -translate-y-1/2 right-3"
                  />
                </div>
              </div>
            </div>
          </UiCard>
        </div>

        <div class="lg:col-span-7 space-y-6">
          <div
            v-if="error"
            class="p-4 bg-red-50 text-red-600 rounded-2xl font-bold"
          >
            {{ error }}
          </div>

          <UiCard
            :class="
              fieldErrors.ingredients ? 'ring-2 ring-red-500 ring-offset-2' : ''
            "
          >
            <div
              class="flex flex-col md:flex-row md:justify-between md:items-center mb-6"
            >
              <h2 class="text-2xl font-black">
                Ingrédients <span class="text-red-500">*</span>
              </h2>

              <span
                v-if="fieldErrors.ingredients"
                class="text-red-500 text-sm font-bold bg-red-50 px-3 py-1 rounded-lg"
              >
                {{ fieldErrors.ingredients }}
              </span>
            </div>

            <div class="space-y-3">
              <div
                v-for="(_, index) in recipeData.ingredients"
                :key="index"
                class="flex gap-3 group"
              >
                <input
                  v-model="recipeData.ingredients[index]"
                  class="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="2 oeufs..."
                  @input="delete fieldErrors.ingredients"
                />

                <button
                  type="button"
                  @click="handleRemove('ingredients', index as number)"
                  class="text-neutral-300 hover:text-red-500 transition-colors px-2"
                >
                  <X />
                </button>
              </div>
            </div>

            <button
              type="button"
              @click="handleAdd('ingredients')"
              class="w-full mt-4 p-3 border-2 border-dashed hover:border-orange-400 rounded-xl text-neutral-400 font-semibold transition-all hover:bg-orange-50 hover:text-orange-500"
            >
              + Ingrédient
            </button>
          </UiCard>

          <UiCard
            :class="
              fieldErrors.steps ? 'ring-2 ring-red-500 ring-offset-2' : ''
            "
          >
            <div
              class="flex flex-col md:flex-row md:justify-between md:items-center mb-6"
            >
              <h2 class="text-2xl font-black">
                Préparation <span class="text-red-500">*</span>
              </h2>

              <span
                v-if="fieldErrors.steps"
                class="text-red-500 text-sm font-bold bg-red-50 px-3 py-1 rounded-lg"
              >
                {{ fieldErrors.steps }}
              </span>
            </div>

            <div class="space-y-6">
              <div
                v-for="(_, index) in recipeData.steps"
                :key="index"
                class="flex gap-4"
              >
                <div
                  class="size-10 hidden md:flex bg-neutral-800 rounded-xl flex items-center justify-center shrink-0 mt-1"
                >
                  <span class="text-white font-medium">
                    {{ (index as number) + 1 }}
                  </span>
                </div>

                <textarea
                  v-model="recipeData.steps[index]"
                  rows="3"
                  class="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl h-[150px] focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Détail de l'étape..."
                  @input="delete fieldErrors.steps"
                />

                <button
                  type="button"
                  @click="handleRemove('steps', index as number)"
                  class="text-neutral-300 hover:text-red-500 transition-colors px-2 self-start mt-4"
                >
                  <X />
                </button>
              </div>
            </div>

            <button
              type="button"
              @click="handleAdd('steps')"
              class="w-full mt-4 p-3 border-2 border-dashed hover:border-orange-400 rounded-xl text-neutral-400 font-semibold transition-all hover:bg-orange-50 hover:text-orange-500"
            >
              + Étape
            </button>
          </UiCard>
        </div>
      </div>
    </div>

    <div
      class="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-50 transition-transform duration-300"
      :class="Object.keys(fieldErrors).length > 0 ? 'translate-y-2' : ''"
    >
      <UiButton
        type="submit"
        :disabled="submitting"
        size="lg"
        class="shadow-lg shadow-orange-500/20"
      >
        <Loader2 v-if="submitting" class="animate-spin mr-2" />

        <span v-else>Enregistrer la recette</span>
      </UiButton>
    </div>
  </form>
</template>
