<script setup lang="ts">
import { Image as ImageIcon, ScanText, Home, Check } from "lucide-vue-next";

const authStore = useAuthStore();

if (!authStore.user.isPremium) {
  await navigateTo("/dashboard");
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 p-6 md:p-12 flex items-center">
    <div class="w-full max-w-7xl flex flex-col justify-center items-center">
      <UiCard>
        <div
          class="h-full flex flex-col items-center justify-center p-8 text-center space-y-6"
        >
          <div
            class="size-24 bg-green-50 rounded-full flex items-center justify-center mb-2 animate-pulse"
          >
            <Check :size="40" class="text-green-500" />
          </div>

          <div>
            <h2 class="text-3xl font-black text-neutral-900 mb-2">
              Votre recette a bien été enregistrée
            </h2>
            <p
              class="text-neutral-500 font-medium leading-relaxed text-balance"
            >
              Vous pouvez continuer de scanner d'autre photos ou alors vous
              pouvez retourner sur votre espace.
            </p>
          </div>

          <div class="flex flex-col gap-4">
            <UiButton size="lg" to="/scan-recipe">
              <ScanText :size="20" />
              <span>Scanner une autre recette</span>
            </UiButton>
            <p class="text-sm text-center text-neutral-400 font-medium">OU</p>
            <UiButton size="lg" to="/dashboard" variant="outline">
              <Home :size="20" />
              <span>Retourner sur mon espace</span>
            </UiButton>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
