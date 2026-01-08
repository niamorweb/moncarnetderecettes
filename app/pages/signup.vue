<script setup lang="ts">
import { BookOpen, Mail, Lock, AlertCircle, Loader2 } from "lucide-vue-next";
import * as z from "zod";
import { useAuthStore } from "~/stores/auth";

// --- 1. Schéma Zod ---
const signupSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  username: z
    .string()
    .min(3, "Le mot de passe doit contenir au moins 3 caractères")
    .max(30, "Le mot de passe doit contenir au maximum 3 caractères")
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Le nom d'utilisateur ne peut contenir que des lettres et des chiffres."
    ),
});

// --- 2. États & Composables ---
const router = useRouter();
const auth = useAuthStore();

const loading = ref(false);
const serverError = ref<string | null>(null);
const isVisible = ref(false);

const formData = reactive({
  email: "",
  username: "",
  password: "",
});

const errors = ref<Record<string, string>>({});

// --- 3. Animation ---
onMounted(() => {
  isVisible.value = true;
});

// --- 4. Typage DTO ---
interface UserDto {
  id: string;
  email: string;
  isEmailVerified: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SignupResponseDto {
  accessToken: string;
  user: UserDto;
}

// --- 5. Fonction Signup ---
const handleSignup = async () => {
  // Reset
  serverError.value = null;
  errors.value = {};

  // Validation
  const result = signupSchema.safeParse(formData);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.value[issue.path[0] as string] = issue.message;
    });
    return;
  }

  loading.value = true;

  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBase as string;

    const res = await $fetch<SignupResponseDto>("/auth/register", {
      method: "POST",
      baseURL: apiBase,
      credentials: "include", // pour refresh token
      body: {
        email: formData.email.trim(),
        password: formData.password,
        username: formData.username,
      },
    });

    // Stockage Pinia
    auth.setAuth(res.accessToken, res.user);

    // Redirection

    // await router.push("/confirm-your-email?email=" + formData.email);
    await router.push("/dashboard");
  } catch (err: any) {
    serverError.value =
      err?.data?.message || err?.message || "Une erreur est survenue.";
    console.error("Erreur signup:", err);
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
              Créer un compte
            </h2>
            <p class="text-neutral-500">
              Commencez votre collection culinaire dès aujourd'hui.
            </p>
          </div>

          <form @submit.prevent="handleSignup" class="space-y-5">
            <div
              v-if="serverError"
              class="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 animate-shake"
            >
              <AlertCircle :size="18" class="shrink-0" />
              <span>{{ serverError }}</span>
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-neutral-700 ml-1"
                >Email</label
              >
              <div class="relative">
                <input
                  v-model="formData.email"
                  type="email"
                  placeholder="nom@exemple.com"
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
              <label class="text-sm font-medium text-neutral-700 ml-1"
                >Nom d'utilisateur</label
              >
              <div class="relative">
                <input
                  v-model="formData.username"
                  type="text"
                  placeholder="someone123"
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
                {{ errors.username }}
              </p>
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-neutral-700 ml-1"
                >Mot de passe</label
              >
              <div class="relative">
                <input
                  v-model="formData.password"
                  type="password"
                  placeholder="••••••••"
                  :class="[
                    'w-full pl-11 pr-4 py-3.5 bg-neutral-50 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all placeholder:text-neutral-400',
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

            <UiButton
              type="submit"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-2 px-6 py-4 bg-neutral-900 text-white font-bold rounded-2xl hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              <Loader2 v-if="loading" class="animate-spin" :size="20" />
              <span v-else>Créer un compte</span>
            </UiButton>
          </form>

          <div class="pt-8 border-t border-neutral-100 text-center">
            <p class="text-neutral-500 text-sm mb-4">
              Vous avez déjà un compte ?
            </p>
            <UiButton variant="ghost" size="sm" to="/login"
              >Connectez-vous ici →</UiButton
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
