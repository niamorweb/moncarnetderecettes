<script setup lang="ts">
import {
  BookOpen,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-vue-next";
import * as z from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Format d'email invalide"),
});

const { $api } = useNuxtApp() as any;
const config = useRuntimeConfig();

const loading = ref(false);
const serverError = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isVisible = ref(false);

const formData = reactive({
  email: "",
});

const errors = ref<Record<string, string>>({});

onMounted(() => {
  isVisible.value = true;
});

const handleForgotPassword = async () => {
  serverError.value = null;
  successMessage.value = null;
  errors.value = {};

  const result = forgotPasswordSchema.safeParse(formData);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      // @ts-ignore
      errors.value[issue.path[0]] = issue.message;
    });
    return;
  }

  loading.value = true;

  try {
    await $api("/auth/forgot-password", {
      method: "POST",
      body: {
        email: formData.email.trim(),
      },
    });

    successMessage.value =
      "Un email de réinitialisation vient de vous être envoyé si votre compte existe.";
  } catch (err: any) {
    serverError.value = "Une erreur est survenue lors de l'envoi de l'email.";
    console.error("Forgot password error:", err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12"
  >
    <div
      class="w-full max-w-md transition-all duration-700 transform"
      :class="
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      "
    >
      <NuxtLink
        to="/"
        class="flex items-center justify-center gap-2 mb-10 group"
      >
        <div
          class="bg-neutral-900 text-white p-2 rounded-xl group-hover:bg-orange-600 transition-colors"
        >
          <BookOpen :size="24" />
        </div>
        <span class="text-2xl font-bold text-neutral-900 tracking-tight"
          >MonCarnetDeRecettes</span
        >
      </NuxtLink>

      <div
        class="bg-white rounded-[2rem] shadow-xl shadow-neutral-200/50 border border-neutral-200 overflow-hidden"
      >
        <div class="p-8 md:p-10">
          <div class="mb-8">
            <h2 class="text-3xl font-bold text-neutral-900 mb-2">
              Mot de passe oublié
            </h2>
            <p class="text-neutral-500">
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>
          </div>

          <form @submit.prevent="handleForgotPassword" class="space-y-5">
            <div
              v-if="serverError"
              class="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 animate-pulse"
            >
              <AlertCircle :size="18" class="shrink-0" />
              <span>{{ serverError }}</span>
            </div>

            <div
              v-if="successMessage"
              class="bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl text-sm flex items-start gap-3"
            >
              <CheckCircle :size="18" class="shrink-0" />
              <span>{{ successMessage }}</span>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-neutral-700 ml-1"
                >Email</label
              >
              <div class="relative">
                <input
                  v-model="formData.email"
                  type="email"
                  placeholder="votre@email.com"
                  :class="[
                    'w-full pl-11 pr-4 py-3.5 bg-neutral-50 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all placeholder:text-neutral-400',
                    errors.email
                      ? 'border-red-500 ring-1 ring-red-500'
                      : 'border-neutral-200',
                  ]"
                />
                <Mail
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  :size="18"
                />
              </div>
              <p v-if="errors.email" class="text-xs text-red-500 ml-1">
                {{ errors.email }}
              </p>
            </div>

            <UiButton
              type="submit"
              :disabled="loading || !!successMessage"
              class="w-full flex items-center justify-center gap-2 px-6 py-4 bg-neutral-900 text-white font-bold rounded-2xl hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              <Loader2 v-if="loading" class="animate-spin" :size="20" />
              <template v-else>Envoyer le lien</template>
            </UiButton>
          </form>

          <div class="pt-8 border-t border-neutral-100 text-center">
            <UiButton to="/login" variant="ghost"
              >← Retour à la connexion</UiButton
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
