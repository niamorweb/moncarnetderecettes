<script setup lang="ts">
import { BookOpen, Mail, Lock, AlertCircle, Loader2 } from "lucide-vue-next";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);
const serverError = ref<string | null>(null);
const formData = reactive({ email: "", password: "" });
const errors = ref<Record<string, string>>({});

const handleLogin = async () => {
  serverError.value = null;
  errors.value = {};

  const result = loginSchema.safeParse(formData);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      // @ts-ignore
      errors.value[issue.path[0]] = issue.message;
    });
    return;
  }

  loading.value = true;
  const config = useRuntimeConfig();

  try {
    const res = await $fetch<any>("/auth/login", {
      method: "POST",
      baseURL: config.public.apiBase,
      body: {
        email: formData.email.trim(),
        password: formData.password,
      },
      credentials: "include",
    });

    // Assure-toi que setAuth utilise un cookie (voir Étape 3)
    authStore.setAuth(res.access_token, res.user);

    // navigateTo est plus sûr que router.push
    await navigateTo("/dashboard");
  } catch (err: any) {
    serverError.value = "Email ou mot de passe incorrect.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12"
  >
    <div class="w-full max-w-md">
      <NuxtLink
        to="/"
        class="flex items-center justify-center gap-2 mb-10 group"
      >
        <div
          class="bg-neutral-900 text-white p-2 rounded-xl group-hover:bg-orange-600 transition-colors"
        >
          <BookOpen :size="24" />
        </div>
        <span class="text-2xl font-bold text-neutral-900 tracking-tight">
          MonCarnetDeRecettes
        </span>
      </NuxtLink>

      <div
        class="bg-white rounded-[2rem] shadow-xl shadow-neutral-200/50 border border-neutral-200 overflow-hidden"
      >
        <div class="p-8 md:p-10">
          <div class="mb-8">
            <h2 class="text-3xl font-bold text-neutral-900 mb-2">
              Bon retour !
            </h2>
            <p class="text-neutral-500">Heureux de vous revoir en cuisine.</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <div
              v-if="serverError"
              class="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 animate-pulse"
            >
              <AlertCircle :size="18" class="shrink-0" />
              <span>{{ serverError }}</span>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-neutral-700 ml-1">
                Email
              </label>
              <div class="relative">
                <input
                  v-model="formData.email"
                  type="email"
                  autocomplete="email"
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

            <div class="space-y-2">
              <div class="flex justify-between items-center ml-1">
                <label class="text-sm font-medium text-neutral-700">
                  Mot de passe
                </label>
                <NuxtLink
                  to="/forgot-password"
                  class="text-xs font-medium text-orange-600 hover:text-orange-700"
                >
                  Oublié ?
                </NuxtLink>
              </div>
              <div class="relative">
                <input
                  v-model="formData.password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  :class="[
                    'w-full pl-11 pr-4 py-3.5 bg-neutral-50 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 placeholder:text-neutral-400',
                    errors.password
                      ? 'border-red-500 ring-1 ring-red-500'
                      : 'border-neutral-200',
                  ]"
                />
                <Lock
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  :size="18"
                />
              </div>
              <p v-if="errors.password" class="text-xs text-red-500 ml-1">
                {{ errors.password }}
              </p>
            </div>

            <UiButton type="submit" :disabled="loading" class="w-full">
              <Loader2 v-if="loading" class="animate-spin" :size="20" />
              <template v-else>Se connecter</template>
            </UiButton>
          </form>

          <div class="pt-8 border-t border-neutral-100 text-center">
            <p class="text-neutral-500 text-sm mb-4">Pas encore de compte ?</p>
            <UiButton variant="ghost" size="sm" to="/signup">
              Créer un compte gratuitement →
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
