<script setup lang="ts">
import { ref } from "vue";
import {
  Camera,
  Image as ImageIcon,
  X,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ScanText,
  Import,
  Download,
  MoveRight,
} from "lucide-vue-next";

const authStore = useAuthStore();

if (!authStore.user.isPremium) {
  await navigateTo("/dashboard");
}

const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string | null>(null);
const isAnalyzing = ref(false);
const error = ref("");
const file = ref<any>(null);
const router = useRouter();

// Déclenche le click sur l'input caché
const triggerCamera = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    file.value = input.files[0];
    previewUrl.value = URL.createObjectURL(input.files[0] as any);
  }
};

const resetScan = () => {
  previewUrl.value = null;
  if (fileInput.value) fileInput.value.value = "";
};

const startAnalysis = async () => {
  if (!previewUrl.value) return;

  if (!file.value) return console.log(",p,");

  isAnalyzing.value = true;
  try {
    const formData = new FormData();
    formData.append("image", file.value);

    const response: any = await $api("/gemini/extract", {
      method: "POST",
      body: formData,
    });

    if (response.success) localStorage.setItem("scan-data", response.data);
    await router.push("/new-recipe?source=scan");
  } catch (err: any) {
    error.value = err.data?.message || "Erreur lors de la création";
    isAnalyzing.value = false;
  } finally {
    isAnalyzing.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-neutral-50 p-6 md:p-12 flex flex-col items-center"
  >
    <div class="w-full max-w-7xl flex flex-col justify-start">
      <div class="w-full flex items-center justify-between mb-8">
        <UiButton size="sm" to="/dashboard" variant="ghost">
          <ChevronLeft :size="20" /> Retour
        </UiButton>

        <div class="w-10"></div>
      </div>

      <div class="flex gap-4">
        <div
          class="flex flex-col gap-2"
          :class="[previewUrl && 'hidden md:flex']"
        >
          <UiCard class="w-fit h-fit">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileChange"
            />

            <div
              class="h-full w-full flex flex-col items-start justify-start p-8 text-center space-y-6"
            >
              <div class="w-full flex flex-col justify-start items-start gap-3">
                <div
                  class="size-24 bg-orange-50 rounded-full flex items-center justify-center mb-2 animate-pulse"
                >
                  <Download :size="40" class="text-orange-500" />
                </div>

                <div class="flex flex-col text-left mb-6">
                  <h2 class="text-3xl font-black text-neutral-900 mb-2">
                    Importez une photo
                  </h2>
                  <p class="text-neutral-500 font-medium leading-relaxed">
                    Assurez-vous que le texte de la recette soit bien lisible et
                    éclairé.
                  </p>
                </div>

                <UiButton v-if="!previewUrl" @click="triggerCamera" size="lg">
                  <span>Choisir la photo</span>
                  <MoveRight :size="20" />
                </UiButton>
                <div v-else class="hidden md:flex items-center gap-3">
                  <UiButton variant="outline" @click="resetScan">
                    <X :size="24" />
                  </UiButton>

                  <UiButton size="lg" @click="startAnalysis">
                    <span>Scanner</span>
                    <ArrowRight :size="20" />
                  </UiButton>
                </div>

                <p class="text-xs text-neutral-400 font-medium mt-4">
                  Cela ouvrira votre galerie d'image
                </p>
                <p
                  class="mt-3 text-neutral-400 text-xs font-medium text-left max-w-xs"
                >
                  Nous utilisons l'IA pour extraire les ingrédients et les
                  instructions automatiquement.
                </p>
              </div>
            </div>
          </UiCard>
        </div>
        <div class="relative h-full bg-black group">
          <img
            v-if="previewUrl"
            :src="previewUrl"
            class="object-cover opacity-90"
          />

          <div
            v-if="isAnalyzing"
            class="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white"
          >
            <Loader2 :size="48" class="animate-spin text-orange-500 mb-4" />
            <p class="font-bold text-lg animate-pulse">
              Lecture de la recette...
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="previewUrl"
        class="absolute md:hidden bottom-0 inset-x-0 p-6 flex items-end justify-between"
      >
        <UiButton variant="outline" @click="resetScan">
          <X :size="24" />
        </UiButton>

        <UiButton size="lg" @click="startAnalysis">
          <span>Scanner</span>
          <ArrowRight :size="20" />
        </UiButton>
      </div>
    </div>
  </div>
</template>
