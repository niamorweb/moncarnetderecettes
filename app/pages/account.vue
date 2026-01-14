<script setup lang="ts">
import {
  Lock,
  ExternalLink,
  Mail,
  Key,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  Check,
  Copy,
  Crown,
  AlertCircle,
} from "lucide-vue-next";

const authStore = useAuthStore();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const router = useRouter();

const username = ref("");
const publicName = ref("");
const newPassword = ref("");
const loading = ref(false);
const copied = ref(false);
const premiumEndsAt = ref(null);
const oldPassword = ref("");

const profileStatus = ref<{ type: "error" | "success"; msg: string } | null>(
  null
);
const passwordStatus = ref<{ type: "error" | "success"; msg: string } | null>(
  null
);

watchEffect(() => console.log("public :", publicName.value));

const isPremium = computed(() => authStore.user?.isPremium || false);

const loadProfileData = async () => {
  try {
    const data = await $fetch<any>(`/profiles/me`, {
      baseURL: apiBase,
      method: "GET",
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
      credentials: "include",
    });

    if (data) {
      username.value = authStore.user?.username || "";
      premiumEndsAt.value = data.premiumEndsAt;
      publicName.value = data.profile.name || "";
    }
  } catch (err) {
    console.error("Erreur lors du fetch profil : ", err);
  }
};

onMounted(() => {
  loadProfileData();
});

const handleProfileUpdate = async () => {
  loading.value = true;
  profileStatus.value = null;

  try {
    await $fetch("/profiles/me", {
      method: "PATCH",
      baseURL: apiBase,
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
      body: {
        username: username.value.trim(),
        public_name: publicName.value.trim(),
      },
    });

    profileStatus.value = { type: "success", msg: "Profil mis à jour !" };

    authStore.user.username = username.value.trim();
  } catch (error: any) {
    profileStatus.value = {
      type: "error",
      msg: error.data?.message || "Erreur de mise à jour",
    };
  } finally {
    loading.value = false;
  }
};

const handleChangePassword = async () => {
  // 1. Validation de base
  if (newPassword.value.length < 8) {
    passwordStatus.value = { type: "error", msg: "8 caractères minimum." };
    return;
  }

  loading.value = true;
  passwordStatus.value = null;

  try {
    // 2. Utilisation de $fetch avec les deux mots de passe
    await $fetch("/auth/update-password", {
      method: "PATCH",
      baseURL: apiBase,
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
      body: {
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
      },
    });

    passwordStatus.value = {
      type: "success",
      msg: "Mot de passe mis à jour !",
    };

    // Reset les champs
    newPassword.value = "";
    oldPassword.value = "";
  } catch (error: any) {
    // 3. Récupération correcte du message d'erreur de NestJS
    // NestJS renvoie l'erreur dans error.data
    const errorMessage = error.data?.message || "Erreur lors du changement.";

    passwordStatus.value = {
      type: "error",
      msg: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage,
    };
  } finally {
    loading.value = false;
  }
};

const handleSignOut = async () => {
  try {
    await $fetch("/auth/logout", {
      method: "POST",
      baseURL: apiBase,
      credentials: "include",
    });
  } catch (e) {
    console.error("Logout backend failed");
  } finally {
    authStore.logout();
    await navigateTo("/");
  }
};

const copyToClipboard = async () => {
  if (!isPremium.value) return;
  const url = `https://moncarnetderecettes.vercel.app/u/${username.value}`;
  try {
    await navigator.clipboard.writeText(url);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (err) {
    console.error(err);
  }
};

const isPremiumModalOpen = ref(false);

const goToStripePayment = async () => {
  isPremiumModalOpen.value = false;
  loading.value = true;

  try {
    const data = await $fetch<{ url: string }>("/webhooks/create-checkout", {
      method: "POST",
      baseURL: apiBase,
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
      credentials: "include",
    });

    if (data.url) {
      window.location.href = data.url;
    }
  } catch (err: any) {
    console.error("Erreur Stripe :", err);
    alert("Impossible d'initier le paiement pour le moment.");
  } finally {
    loading.value = false;
  }
};

const openPremiumModal = () => {
  isPremiumModalOpen.value = true;
};

const handleCancelSubscription = async () => {
  const confirmCancel = confirm(
    "Êtes-vous sûr de vouloir résilier votre abonnement ? Vous garderez vos accès jusqu'à la fin de la période en cours."
  );

  if (!confirmCancel) return;

  loading.value = true;
  try {
    await $fetch("/webhooks/cancel-subscription", {
      method: "POST",
      baseURL: apiBase,
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    });

    isPremiumModalOpen.value = false;

    profileStatus.value = {
      type: "success",
      msg: "Votre abonnement ne sera pas renouvelé. Accès maintenu jusqu'à l'échéance.",
    };
  } catch (err: any) {
    console.error("Erreur lors de l'annulation:", err);
    alert(
      err.data?.message || "Une erreur est survenue lors de la résiliation."
    );
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const premiumUntil = computed(() => premiumEndsAt.value);
</script>

<template>
  <div>
    <OffersModal
      :isOpen="isPremiumModalOpen"
      @close="isPremiumModalOpen = false"
      @upgrade="goToStripePayment"
      :is-premium="isPremium"
      @cancel-subscription="handleCancelSubscription"
    />
    <div class="min-h-screen bg-neutral-50 pb-20">
      <div class="p-6 md:p-12 max-w-7xl w-full mx-auto">
        <div class="flex items-center gap-3 justify-between mb-10">
          <UiButton size="sm" to="/dashboard" variant="ghost">
            <ChevronLeft :size="14" />
            Retour
          </UiButton>
          <UiButton size="sm" variant="destructive" @click="handleSignOut">
            Déconnexion
          </UiButton>
        </div>

        <ClientOnly>
          <div
            class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
          >
            <div>
              <h1 class="text-4xl font-black text-neutral-900 tracking-tight">
                Mon Compte
              </h1>
              <p class="text-neutral-500 font-medium mt-2">
                Gérez vos informations et votre abonnement
              </p>
            </div>

            <div
              class="flex items-center justify-between gap-4 p-4 rounded-[2rem] border shadow-sm transition-all"
              :class="
                isPremium
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-white border-neutral-200'
              "
            >
              <div class="flex items-center gap-4">
                <div
                  :class="isPremium ? 'bg-orange-500' : 'bg-neutral-100'"
                  class="p-3 rounded-2xl"
                >
                  <Crown v-if="isPremium" class="text-white size-6" />
                  <Lock v-else class="text-neutral-400 size-6" />
                </div>
                <div class="pr-4">
                  <p
                    class="text-[10px] font-black uppercase tracking-widest"
                    :class="isPremium ? 'text-orange-600' : 'text-neutral-400'"
                  >
                    Abonnement
                  </p>
                  <p class="font-bold text-neutral-900">
                    {{ isPremium ? "Membre Premium" : "Plan Gratuit" }}
                  </p>

                  <p
                    v-if="isPremium && premiumUntil"
                    class="text-[11px] text-orange-700/70 font-medium"
                  >
                    Jusqu'au {{ formatDate(premiumUntil) }}
                  </p>
                </div>
              </div>

              <button
                v-if="!premiumEndsAt"
                @click="openPremiumModal"
                class="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors"
              >
                {{ isPremium ? "Gérer" : "Mettre à niveau" }}
              </button>
            </div>
          </div>
        </ClientOnly>

        <div
          class="bg-white border border-neutral-200 p-8 rounded-[2.5rem] shadow-xl mb-8"
        >
          <h2
            class="text-xl font-black pb-4 mb-8 text-neutral-900 flex items-center gap-3 border-b border-neutral-100"
          >
            <div class="p-2 bg-orange-100 rounded-lg">
              <ExternalLink class="size-5 text-orange-600" />
            </div>
            Informations Publiques
          </h2>

          <div
            v-if="profileStatus"
            :class="[
              'p-4 rounded-2xl mb-6 font-bold flex items-center gap-2',
              profileStatus.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600',
            ]"
          >
            <CheckCircle2 v-if="profileStatus.type === 'success'" :size="18" />
            {{ profileStatus.msg }}
          </div>

          <form @submit.prevent="handleProfileUpdate" class="space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-3">
                <label class="text-sm font-bold text-neutral-700"
                  >Nom d'affichage</label
                >
                <input
                  v-model="publicName"
                  autocomplete="name"
                  type="text"
                  class="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>

              <div class="space-y-3">
                <label class="text-sm font-bold text-neutral-700"
                  >Nom d'utilisateur (identifiant URL)</label
                >
                <input
                  v-model="username"
                  autocomplete="username"
                  type="text"
                  class="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  @input="
                    username = username.toLowerCase().replace(/[^a-z0-9_]/g, '')
                  "
                />
              </div>
            </div>

            <div class="relative group mt-4">
              <div
                :class="[
                  'group relative p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between gap-4 overflow-hidden transition-colors ',
                  isPremium ? 'hover:border-orange-200' : 'cursor-not-allowed',
                ]"
              >
                <div class="min-w-0">
                  <p
                    :class="[
                      'text-sm font-medium mb-2',
                      isPremium ? 'text-neutral-700' : 'text-neutral-400',
                    ]"
                  >
                    Votre lien public :
                  </p>

                  <p
                    :class="[
                      'text-sm font-medium truncate',

                      isPremium ? 'text-orange-600' : 'text-neutral-400',
                    ]"
                  >
                    https://moncarnetderecettes.vercel.app/u/{{
                      (authStore.user && authStore.user.username) || "..."
                    }}
                  </p>
                </div>

                <button
                  v-if="isPremium"
                  type="button"
                  @click="copyToClipboard"
                  :class="[
                    'shrink-0 p-3 rounded-xl transition-all duration-200 flex items-center gap-2',

                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-neutral-600 shadow-sm border border-neutral-200 hover:border-orange-400 hover:text-orange-600',
                  ]"
                >
                  <Check v-if="copied" :size="16" />

                  <Copy v-else :size="16" />

                  <span
                    class="text-xs font-black uppercase tracking-tight hidden sm:block"
                    >{{ copied ? "Copié !" : "Copier" }}</span
                  >
                </button>
                <div
                  v-if="!isPremium"
                  class="bg-neutral-100 flex items-center justify-center size-12 rounded-lg"
                >
                  <Lock class="text-neutral-600" />
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-4">
              <UiButton type="submit" :disabled="loading" variant="primary">
                <Loader2 v-if="loading" class="animate-spin" :size="18" />
                Mettre à jour le profil
              </UiButton>
            </div>
          </form>
        </div>

        <div
          class="bg-white border border-neutral-200 p-8 rounded-[2.5rem] shadow-xl"
        >
          <h2
            class="text-xl font-black pb-4 mb-8 text-neutral-900 flex items-center gap-3 border-b border-neutral-100"
          >
            <div class="p-2 bg-neutral-100 rounded-lg">
              <Lock class="size-5 text-neutral-600" />
            </div>
            Sécurité & Accès
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <label
                class="text-sm font-bold text-neutral-700 uppercase tracking-widest text-[10px]"
                >E-mail de connexion</label
              >
              <div class="w-full flex flex-col gap-2">
                <label class="text-sm text-neutral-800" for="old-password"
                  >Adresse email</label
                >
                <div
                  class="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm text-neutral-500 font-bold"
                >
                  <Mail class="size-4" />
                  {{ authStore?.user?.email }}
                </div>
              </div>
            </div>

            <form @submit.prevent="handleChangePassword" class="space-y-4">
              <label
                class="text-sm font-bold text-neutral-700 uppercase tracking-widest text-[10px]"
                >Changer de mot de passe</label
              >
              <div class="flex flex-col gap-4">
                <div class="w-full flex flex-col gap-2">
                  <label class="text-sm text-neutral-800" for="old-password"
                    >Mot de passe actuel</label
                  >
                  <input
                    name="old-password"
                    v-model="oldPassword"
                    autocomplete="old-password"
                    type="password"
                    placeholder="Min. 6 caractères"
                    class="flex-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div class="w-full flex flex-col gap-2">
                  <label class="text-sm text-neutral-800" for="new-password"
                    >Nouveau mot de passe</label
                  >
                  <input
                    v-model="newPassword"
                    name="new-password"
                    autocomplete="new-password"
                    type="password"
                    placeholder="Min. 6 caractères"
                    class="flex-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <p
                v-if="passwordStatus"
                :class="
                  passwordStatus.type === 'success'
                    ? 'text-green-600'
                    : 'text-red-600'
                "
                class="text-[10px] font-bold"
              >
                {{ passwordStatus.msg }}
              </p>
              <div class="w-full flex justify-end">
                <UiButton
                  type="submit"
                  :disabled="loading || !oldPassword || newPassword.length < 6"
                  variant="primary"
                >
                  Changer le mot de passe
                </UiButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
