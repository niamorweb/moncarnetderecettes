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
import Card from "~/components/ui/card.vue";

const authStore = useAuthStore();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const router = useRouter();

// Public profile data
const username = ref("");
const publicName = ref("");
const bio = ref("");
const avatar = ref<null | File>(null);
const dbAvatarUrl = ref<string>("");

const newPassword = ref("");
const loading = ref(false);
const copied = ref(false);
const premiumEndsAt = ref(null);
const oldPassword = ref("");

const profileStatus = ref<{ type: "error" | "success"; msg: string } | null>(
  null,
);
const passwordStatus = ref<{ type: "error" | "success"; msg: string } | null>(
  null,
);

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
      console.log("data ;;;", data);
      console.log("data ;;;", data.profile);
      console.log("data ;;;", data.profile.avatar_url);

      username.value = authStore.user?.username || "";
      premiumEndsAt.value = data.premiumEndsAt;
      publicName.value = data.profile.name || "";
      dbAvatarUrl.value = data.profile.avatar_url;
      bio.value = data.bio;

      console.log("dbAvatarUrl :: ", dbAvatarUrl.value);
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
    const formData = new FormData();
    formData.append("username", username.value);
    formData.append("bio", bio.value);
    formData.append("public_name", publicName.value);
    if (avatar.value) {
      formData.append("avatar", avatar.value);
    }

    await $fetch("/profiles/me", {
      method: "PATCH",
      baseURL: apiBase,
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
      body: formData,
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
    "Êtes-vous sûr de vouloir résilier votre abonnement ? Vous garderez vos accès jusqu'à la fin de la période en cours.",
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
      err.data?.message || "Une erreur est survenue lors de la résiliation.",
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

const fileInput = ref<HTMLInputElement | null>(null);
const profilePictureUrl = ref<string | null>(null); // Pour l'aperçu local

const triggerFileInput = () => fileInput.value?.click();

const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    // Crée une URL temporaire pour l'aperçu immédiat
    profilePictureUrl.value = URL.createObjectURL(file);
    avatar.value = file;
  }
};
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

        <Card class="mb-6">
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
              'p-4 fixed top-4 z-40 rounded-2xl mb-6 font-bold flex items-center gap-2',
              profileStatus.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600',
            ]"
          >
            <CheckCircle2 v-if="profileStatus.type === 'success'" :size="18" />
            {{ profileStatus.msg }}
          </div>

          <form @submit.prevent="handleProfileUpdate" class="space-y-8">
            <div class="flex flex-col md:grid md:grid-cols-2 gap-6">
              <div class="flex flex-col col-span-2 items-center gap-4 mb-8">
                <div
                  @click="triggerFileInput"
                  class="relative group cursor-pointer"
                >
                  <div
                    class="size-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-neutral-100 flex items-center justify-center"
                  >
                    <img
                      v-if="profilePictureUrl || dbAvatarUrl"
                      :src="profilePictureUrl || dbAvatarUrl"
                      class="w-full h-full object-cover"
                    />
                    <User
                      v-else
                      class="size-10 z-30 relative text-neutral-400"
                    />

                    <div
                      class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera class="text-white" :size="24" />
                    </div>
                  </div>

                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileChange"
                  />
                </div>
                <p class="text-xs text-neutral-500 font-medium">
                  Cliquez pour modifier la photo
                </p>
              </div>
              <div class="space-y-3">
                <label class="text-sm font-bold text-neutral-700"
                  >Nom d'affichage</label
                >
                <UiInput
                  v-model="publicName"
                  placeholder="Nom d'affichage public"
                  autocomplete="name"
                  type="text"
                />
              </div>
              <div class="space-y-3">
                <label class="text-sm font-bold text-neutral-700">Bio</label>
                <UiInput
                  v-model="bio"
                  placeholder="Une petite bio"
                  autocomplete="bio"
                  type="text"
                  :is-text-area="true"
                />
              </div>

              <div class="space-y-3">
                <label class="text-sm font-bold text-neutral-700"
                  >Nom d'utilisateur (identifiant URL)</label
                >
                <UiInput
                  v-model="username"
                  autocomplete="username"
                  placeholder="Nom d'utilisateur"
                  type="text"
                  class="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
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
        </Card>

        <Card class="mb-6">
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
                  class="cursor-not-allowed border border-neutral-200 flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm text-neutral-500 font-medium"
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
                  <UiInput
                    name="old-password"
                    v-model="oldPassword"
                    autocomplete="old-password"
                    type="password"
                    placeholder="Min. 6 caractères"
                  />
                </div>
                <div class="w-full flex flex-col gap-2">
                  <label class="text-sm text-neutral-800" for="new-password"
                    >Nouveau mot de passe</label
                  >
                  <UiInput
                    v-model="newPassword"
                    name="new-password"
                    autocomplete="new-password"
                    type="password"
                    placeholder="Min. 6 caractères"
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
        </Card>
      </div>
    </div>
  </div>
</template>
