<script setup lang="ts">
import { ChevronLeft, X, Loader2, AlertCircle } from "lucide-vue-next";

import type { Recipe } from "~/types/models/recipe";

import { z } from "zod";

const route = useRoute();
const router = useRouter();
const { $api } = useNuxtApp() as any;
const recipeId = route.params.id as string;
const auth = useAuthStore();
const recipe = ref<Recipe | null>(null);
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

const loading = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);
const fieldErrors = ref<Record<string, string>>({}); // Stockage des erreurs Zod
const imageFile = ref<File | null>(null);

const recipeData = reactive({
  name: "",
  prep_time: "" as string | number,
  cook_time: "" as string | number,
  servings: "" as string | number,
  ingredients: [""] as string[],
  steps: [""] as string[],
  initialImageUrl: null as string | null,
  categoryId: null as string | null,
});

const loadRecipeData = async () => {
  try {
    const data = await $fetch<Recipe>(`/recipes/${recipeId}`, {
      baseURL: apiBase,
      method: "GET",
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      credentials: "include",
    });

    recipe.value = data;

    if (data) {
      recipeData.name = data.name || "";
      recipeData.prep_time = data.prep_time || "";
      recipeData.cook_time = data.cook_time || "";
      recipeData.servings = data.servings || "";
      recipeData.ingredients = data.ingredients?.length
        ? [...data.ingredients]
        : [""];
      recipeData.steps = data.steps?.length ? [...data.steps] : [""];
      recipeData.categoryId = data.categoryId || null;
      recipeData.initialImageUrl = data.image_url || null;
    }
  } catch (err) {
    console.error("Erreur lors du fetch : ", err);
    error.value = "Impossible de charger la recette.";
  }
};

onMounted(() => {
  loadRecipeData();
});

// 4. Schéma Zod (Adapté pour l'édition)

const recipeSchema = z.object({
  name: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
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
  // Image optionnelle en édition (on valide le type seulement si un fichier est uploadé)
  image: z
    .custom<File | null>()
    .refine((file) => {
      if (!file) return true; // Pas de nouveau fichier = OK
      return ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
        file.type
      );
    }, "Format invalide (.png, .jpg, .webp)")
    .refine((file) => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024;
    }, "L'image ne doit pas dépasser 5 Mo"),
});

// 5. Logique d'aperçu d'image

const imagePreview = computed(() => {
  if (imageFile.value) return URL.createObjectURL(imageFile.value);
  return recipeData.initialImageUrl;
});

// 6. Méthodes d'action

const handleImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement;

  if (target.files?.[0]) {
    imageFile.value = target.files[0];
    delete fieldErrors.value.image; // Reset erreur visuelle
  }
};

const handleAdd = (type: "ingredients" | "steps") => {
  recipeData[type].push("");
};

const handleRemove = (type: "ingredients" | "steps", index: number) => {
  recipeData[type] = recipeData[type].filter((_, i) => i !== index);

  if (recipeData[type].length === 0) recipeData[type] = [""];
  delete fieldErrors.value[type];
};

const handleSubmit = async () => {
  fieldErrors.value = {};
  error.value = null;
  const payloadToValidate = {
    ...recipeData,
    image: imageFile.value,
  };
  const validation = recipeSchema.safeParse(payloadToValidate);

  if (!validation.success) {
    const formattedErrors = validation.error.flatten().fieldErrors;

    for (const field in formattedErrors) {
      // @ts-ignore
      if (formattedErrors[field]) {
        // @ts-ignore
        fieldErrors.value[field] = formattedErrors[field]![0];
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  submitting.value = true;

  try {
    const formData = new FormData();
    formData.append("name", recipeData.name);

    if (recipeData.servings)
      formData.append("servings", recipeData.servings.toString());

    if (recipeData.prep_time)
      formData.append("prep_time", recipeData.prep_time.toString());

    if (recipeData.cook_time)
      formData.append("cook_time", recipeData.cook_time.toString());

    if (recipeData.categoryId)
      formData.append("categoryId", recipeData.categoryId);

    recipeData.ingredients
      .filter((i) => i.trim())
      .forEach((ing) => formData.append("ingredients[]", ing));

    recipeData.steps
      .filter((s) => s.trim())
      .forEach((step) => formData.append("steps[]", step));

    if (imageFile.value) {
      formData.append("image", imageFile.value);
    }

    await $fetch<Recipe>(`/recipes/${recipeId}`, {
      baseURL: apiBase,
      method: "PATCH",
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      credentials: "include",
      body: formData,
    });

    router.push("/dashboard");
  } catch (err: any) {
    const backendMsg = err.data?.message;

    if (Array.isArray(backendMsg)) {
      error.value = "Veuillez corriger les erreurs indiquées.";
      backendMsg.forEach((msg: string) => {
        if (msg.includes("name")) fieldErrors.value.name = msg;

        if (msg.includes("prep_time")) fieldErrors.value.prep_time = msg;
      });
    } else {
      error.value = backendMsg || "Erreur lors de la sauvegarde";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  } finally {
    submitting.value = false;
  }
};

const getInputClass = (fieldName: string) => {
  const base =
    "w-full px-4 py-3 bg-white border rounded-xl focus:outline-none transition-all placeholder:text-gray-400 ";

  if (fieldErrors.value[fieldName]) {
    return base + "border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/30";
  }

  return base + "border-gray-200 focus:ring-2 focus:ring-orange-400";
};
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="min-h-screen bg-neutral-50 pt-12 pb-32 px-4"
  >
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <UiButton size="sm" to="/dashboard" variant="ghost">
          <ChevronLeft :size="14" /> Dashboard
        </UiButton>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-5 space-y-6">
          <div
            class="bg-white p-8 rounded-[2.5rem] shadow-xl border border-neutral-100"
          >
            <h1
              class="text-3xl font-black mb-6 text-neutral-900 flex items-center gap-2"
            >
              Édition

              <span
                class="text-xs font-normal text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full"
                >* requis</span
              >
            </h1>

            <div class="mb-6">
              <label
                class="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-3"
              >
                Photo
              </label>

              <div
                class="relative aspect-video rounded-3xl border-2 border-dashed overflow-hidden bg-neutral-50 transition-colors"
                :class="
                  fieldErrors.image
                    ? 'border-red-400 bg-red-50'
                    : 'border-neutral-200'
                "
              >
                <NuxtImg
                  v-if="imagePreview"
                  :src="imagePreview"
                  class="object-cover w-full h-full"
                />

                <div
                  v-else
                  class="flex items-center justify-center h-full text-neutral-400 font-bold"
                >
                  Ajouter une image
                </div>

                <input
                  type="file"
                  accept=".png, .jpeg, .jpg, .webp"
                  @change="handleImageChange"
                  class="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <p
                v-if="fieldErrors.image"
                class="text-red-500 text-xs font-bold mt-2"
              >
                {{ fieldErrors.image }}
              </p>
            </div>

            <div class="space-y-4">
              <div>
                <label
                  class="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1"
                >
                  Titre <span class="text-red-500">*</span>
                </label>

                <input
                  v-model="recipeData.name"
                  :class="[getInputClass('name'), 'text-lg font-bold']"
                  placeholder="Titre..."
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
                  />
                </div>

                <div>
                  <label
                    class="block text-[10px] font-black uppercase text-neutral-400 mb-1"
                  >
                    Cuisson
                  </label>

                  <input
                    v-model="recipeData.cook_time"
                    type="number"
                    :class="getInputClass('cook_time')"
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
                  />
                </div>
              </div>

              <div
                v-if="fieldErrors.prep_time || fieldErrors.servings"
                class="text-red-500 text-xs font-bold"
              >
                Vérifiez les temps et le nombre de parts.
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-7 space-y-6">
          <div
            v-if="error"
            class="p-4 bg-red-50 text-red-600 rounded-2xl font-bold animate-pulse border border-red-100 flex items-center gap-2"
          >
            <AlertCircle :size="20" /> {{ error }}
          </div>

          <div
            class="bg-white p-8 rounded-[2.5rem] shadow-xl transition-all"
            :class="
              fieldErrors.ingredients ? 'ring-2 ring-red-500 ring-offset-2' : ''
            "
          >
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-black text-neutral-900">
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
                class="flex gap-3"
              >
                <input
                  v-model="recipeData.ingredients[index]"
                  :class="getInputClass('ingredients')"
                  placeholder="Ex: 200g de farine"
                  @input="delete fieldErrors.ingredients"
                />

                <button
                  type="button"
                  @click="handleRemove('ingredients', index)"
                  class="text-neutral-300 hover:text-red-500 transition-colors"
                >
                  <X />
                </button>
              </div>
            </div>

            <button
              type="button"
              @click="handleAdd('ingredients')"
              class="w-full mt-4 p-3 border-2 border-dashed border-neutral-200 hover:border-orange-400 rounded-xl text-neutral-400 font-bold transition-all"
            >
              + Ajouter
            </button>
          </div>

          <div
            class="bg-white p-8 rounded-[2.5rem] shadow-xl transition-all"
            :class="
              fieldErrors.steps ? 'ring-2 ring-red-500 ring-offset-2' : ''
            "
          >
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-black text-neutral-900">
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
                <span
                  class="size-8 bg-neutral-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0 mt-2"
                  >{{ index + 1 }}</span
                >

                <textarea
                  v-model="recipeData.steps[index]"
                  rows="3"
                  :class="getInputClass('steps')"
                  placeholder="Décrivez l'étape..."
                  @input="delete fieldErrors.steps"
                />

                <button
                  type="button"
                  @click="handleRemove('steps', index)"
                  class="text-neutral-300 hover:text-red-500 transition-colors mt-2"
                >
                  <X />
                </button>
              </div>
            </div>

            <button
              type="button"
              @click="handleAdd('steps')"
              class="w-full mt-6 p-3 border-2 border-dashed border-neutral-200 hover:border-orange-400 rounded-xl text-neutral-400 font-bold transition-all"
            >
              + Ajouter une étape
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-neutral-200 flex gap-4 z-50"
    >
      <UiButton type="button" @click="router.back()" variant="outline"
        >Annuler</UiButton
      >

      <UiButton type="submit" :disabled="submitting" variant="primary">
        <Loader2 v-if="submitting" class="animate-spin" :size="18" />

        {{ submitting ? "Sauvegarde..." : "Sauvegarder" }}
      </UiButton>
    </div>
  </form>
</template>
