<script setup lang="ts">
import { BookOpen, Mail, Loader2, CheckCircle } from "lucide-vue-next";

const route = useRoute();
const config = useRuntimeConfig();

const email = computed(() => route.query.email as string);

const loading = ref(false);
const sent = ref(false);
const errorMsg = ref("");
const cooldown = ref(0);
let timerInterval: any = null;

const startCooldown = (seconds: number) => {
  cooldown.value = seconds;
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    cooldown.value--;
    if (cooldown.value <= 0) {
      clearInterval(timerInterval);
      cooldown.value = 0;
    }
  }, 1000);
};

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const handleResend = async () => {
  if (!email.value || loading.value || cooldown.value > 0) return;

  loading.value = true;
  errorMsg.value = "";
  sent.value = false;

  try {
    await $fetch(`${config.public.apiBase}/auth/resend-verification`, {
      method: "POST",
      body: { email: email.value },
    });

    sent.value = true;
    startCooldown(20);

    setTimeout(() => (sent.value = false), 5000);
  } catch (err: any) {
    errorMsg.value = err.data?.message || "Une erreur est survenue.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12"
  >
    <div class="w-full max-w-md text-center">
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
        class="bg-white rounded-[2rem] shadow-xl shadow-neutral-200/50 border border-neutral-200 p-10"
      >
        <div
          v-if="sent"
          class="mx-auto mb-6 w-16 h-16 flex items-center justify-center bg-green-100 rounded-full text-green-600 animate-in zoom-in duration-300"
        >
          <CheckCircle :size="32" />
        </div>
        <h2 class="text-3xl font-bold text-neutral-900 mb-2">
          Vérifiez votre boîte mail (spams)
        </h2>

        <p class="text-neutral-500 mb-8">
          Un lien de confirmation a été envoyé à
          <span class="font-bold text-neutral-800">{{
            email || "votre adresse"
          }}</span
          >. Veuillez cliquer dessus pour finaliser la création de votre compte.
        </p>

        <p
          v-if="errorMsg"
          class="mb-4 text-sm font-bold text-red-500 bg-red-50 p-3 rounded-lg"
        >
          {{ errorMsg }}
        </p>

        <p
          v-if="sent"
          class="mb-4 text-sm font-bold text-green-600 bg-green-50 p-3 rounded-lg"
        >
          Email renvoyé avec succès !
        </p>

        <UiButton
          variant="outline"
          :disabled="loading || cooldown > 0"
          :class="[
            'w-full px-6 py-4 border-2 font-bold rounded-2xl transition-all duration-300',
            cooldown > 0
              ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed'
              : 'border-neutral-900 text-neutral-900 hover:bg-neutral-50',
          ]"
          @click="handleResend"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <Loader2 class="animate-spin" :size="20" /> Envoi en cours...
          </span>

          <span
            v-else-if="cooldown > 0"
            class="flex items-center justify-center gap-2"
          >
            Renvoyer dans {{ cooldown }}s
          </span>

          <span v-else> Renvoyer l'email </span>
        </UiButton>

        <p
          v-if="cooldown > 0"
          class="mt-4 text-xs text-neutral-400 font-medium"
        >
          Merci de patienter avant de faire une nouvelle demande pour éviter les
          spams.
        </p>
      </div>
    </div>
  </div>
</template>
