<script setup lang="ts">
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-vue-next";

const route = useRoute();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const auth = useAuthStore();

// États pour gérer l'affichage
const status = ref<"loading" | "success" | "error">("loading");
const message = ref("Vérification en cours...");

onMounted(async () => {
  const token = route.query.token as string;

  //  Si pas de token dans l'URL
  if (!token) {
    status.value = "error";
    message.value = "Jeton de vérification manquant.";
    return;
  }

  try {
    //  Appel au backend pour valider le token
    const response = await $fetch<any>("/auth/verify", {
      baseURL: apiBase,
      method: "GET",
      params: { token },
      credentials: "include",
    });

    auth.setAuth(response.access_token, response.user);

    status.value = "success";
    message.value = response.message || "Email vérifié avec succès !";

    setTimeout(() => {
      navigateTo("/dashboard");
    }, 2000);
  } catch (error: any) {
    status.value = "error";
    message.value = error.data?.message || "Le lien est invalide ou a expiré.";
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
    <div
      class="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-8 text-center border border-neutral-100"
    >
      <div v-if="status === 'loading'" class="flex flex-col items-center">
        <Loader2 class="size-12 text-orange-500 animate-spin mb-4" />
        <h1 class="text-xl font-black text-neutral-900 mb-2">
          Vérification en cours
        </h1>
        <p class="text-neutral-500 font-medium">Nous validons votre lien...</p>
      </div>

      <div v-else-if="status === 'success'" class="flex flex-col items-center">
        <div
          class="size-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 class="size-8 text-green-600" />
        </div>
        <h1 class="text-2xl font-black text-neutral-900 mb-2">
          Compte vérifié !
        </h1>
        <p class="text-neutral-600 font-medium mb-6">{{ message }}</p>

        <div
          class="flex items-center gap-2 text-sm font-bold text-orange-600 animate-pulse"
        >
          Redirection vers le dashboard...
          <ArrowRight class="size-4" />
        </div>
      </div>

      <div v-else class="flex flex-col items-center">
        <div
          class="size-16 bg-red-100 rounded-full flex items-center justify-center mb-6"
        >
          <XCircle class="size-8 text-red-600" />
        </div>
        <h1 class="text-2xl font-black text-neutral-900 mb-2">Oups !</h1>
        <p class="text-neutral-600 font-medium mb-8">{{ message }}</p>

        <NuxtLink
          to="/login"
          class="px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-all w-full"
        >
          Retour à la connexion
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
