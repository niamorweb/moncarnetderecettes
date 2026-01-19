<template>
  <Transition name="fade">
    <div>
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 backdrop-blur-sm p-4"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div class="px-8 py-6 border-b border-neutral-100 bg-white z-10">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-bold text-neutral-900">
                  Finaliser la commande
                </h2>
                <p class="text-sm text-neutral-500">
                  Configuration, Livraison et Paiement.
                </p>
              </div>
              <button
                @click="$emit('close')"
                class="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400"
              >
                <X :size="20" />
              </button>
            </div>

            <div class="flex items-center gap-2">
              <div
                v-for="step in totalSteps"
                :key="step"
                class="h-1.5 rounded-full flex-1 transition-all duration-500"
                :class="
                  step <= currentStep ? 'bg-orange-600' : 'bg-neutral-200'
                "
              />
            </div>
            <div
              class="flex justify-between mt-2 text-xs font-medium text-neutral-400 px-1"
            >
              <span>Couverture</span>
              <span>Papier</span>
              <span>Finition</span>
              <span>Livraison</span>
              <span>Payer</span>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-8 bg-neutral-50">
            <Transition name="slide-fade" mode="out-in">
              <div v-if="currentStep === 1" key="step1" class="space-y-6">
                <h3 class="text-lg font-semibold text-neutral-800">
                  Quel type de couverture ?
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    v-for="option in coverOptions"
                    :key="option.id"
                    @click="orderConfig.coverType = option.id"
                    :class="[
                      'relative p-6 text-left rounded-xl border-2 transition-all duration-200 hover:shadow-md group',
                      orderConfig.coverType === option.id
                        ? 'border-orange-600 bg-orange-50/50 ring-1 ring-orange-600'
                        : 'border-neutral-200 bg-white hover:border-orange-300',
                    ]"
                  >
                    <div class="flex justify-between items-start mb-4 mr-4">
                      <div
                        class="size-10 rounded-full flex items-center justify-center transition-colors"
                        :class="
                          orderConfig.coverType === option.id
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-neutral-100 text-neutral-600'
                        "
                      >
                        <component :is="option.icon" :size="20" />
                      </div>
                      <span
                        class="text-xs font-bold bg-neutral-100 px-2 py-1 rounded text-neutral-600"
                      >
                        +{{ option.price }}€
                      </span>
                    </div>
                    <div class="font-bold text-neutral-900 mb-1">
                      {{ option.name }}
                    </div>
                    <p class="text-sm text-neutral-500 leading-relaxed">
                      {{ option.description }}
                    </p>
                    <div
                      v-if="orderConfig.coverType === option.id"
                      class="absolute top-4 right-4 text-orange-600"
                    >
                      <CheckCircle2 :size="20" />
                    </div>
                  </button>
                </div>
              </div>

              <div v-else-if="currentStep === 2" key="step2" class="space-y-6">
                <h3 class="text-lg font-semibold text-neutral-800">
                  Choix du papier
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    v-for="option in paperOptions"
                    :key="option.id"
                    @click="orderConfig.paperType = option.id"
                    :class="[
                      'relative p-6 text-left rounded-xl border-2 transition-all duration-200 hover:shadow-md',
                      orderConfig.paperType === option.id
                        ? 'border-orange-600 bg-orange-50/50 ring-1 ring-orange-600'
                        : 'border-neutral-200 bg-white hover:border-orange-300',
                    ]"
                  >
                    <div class="flex justify-between items-start mb-4">
                      <div
                        class="size-10 rounded-full flex items-center justify-center transition-colors"
                        :class="
                          orderConfig.paperType === option.id
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-neutral-100 text-neutral-600'
                        "
                      >
                        <component :is="option.icon" :size="20" />
                      </div>
                      <span
                        class="text-xs font-bold bg-neutral-100 px-2 py-1 rounded text-neutral-600"
                      >
                        +{{ option.price }}€
                      </span>
                    </div>
                    <div class="font-bold text-neutral-900 mb-1">
                      {{ option.name }}
                    </div>
                    <p class="text-sm text-neutral-500 leading-relaxed">
                      {{ option.description }}
                    </p>
                    <div
                      v-if="orderConfig.paperType === option.id"
                      class="absolute top-4 right-4 text-orange-600"
                    >
                      <CheckCircle2 :size="20" />
                    </div>
                  </button>
                </div>
              </div>

              <div v-else-if="currentStep === 3" key="step3" class="space-y-6">
                <h3 class="text-lg font-semibold text-neutral-800">
                  Finition de couverture
                </h3>
                <div class="grid grid-cols-1 gap-4">
                  <button
                    v-for="option in finishOptions"
                    :key="option.id"
                    @click="orderConfig.finishType = option.id"
                    :class="[
                      'relative p-4 flex items-center gap-4 text-left rounded-xl border-2 transition-all duration-200 hover:shadow-md',
                      orderConfig.finishType === option.id
                        ? 'border-orange-600 bg-orange-50/50 ring-1 ring-orange-600'
                        : 'border-neutral-200 bg-white hover:border-orange-300',
                    ]"
                  >
                    <div
                      class="size-12 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                      :class="
                        orderConfig.finishType === option.id
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-neutral-100 text-neutral-600'
                      "
                    >
                      <component :is="option.icon" :size="24" />
                    </div>
                    <div>
                      <div class="font-bold text-neutral-900">
                        {{ option.name }}
                      </div>
                      <p class="text-sm text-neutral-500">
                        {{ option.description }}
                      </p>
                    </div>
                    <div
                      v-if="orderConfig.finishType === option.id"
                      class="absolute top-1/2 -translate-y-1/2 right-6 text-orange-600"
                    >
                      <CheckCircle2 :size="24" />
                    </div>
                  </button>
                </div>
              </div>

              <div v-else-if="currentStep === 4" key="step4" class="space-y-6">
                <h3 class="text-lg font-semibold text-neutral-800">
                  Adresse de livraison
                </h3>
                <div class="grid grid-cols-1 gap-4">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-neutral-500 uppercase"
                      >Nom complet</label
                    >
                    <input
                      v-model="shipping.name"
                      type="text"
                      class="w-full p-3 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      placeholder="Jean Dupont"
                    />
                  </div>

                  <div class="space-y-1">
                    <label class="text-xs font-bold text-neutral-500 uppercase"
                      >Adresse (Ligne 1)</label
                    >
                    <input
                      v-model="shipping.line1"
                      type="text"
                      class="w-full p-3 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="10 rue de la Paix"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label
                        class="text-xs font-bold text-neutral-500 uppercase"
                        >Code Postal</label
                      >
                      <input
                        v-model="shipping.postalCode"
                        type="text"
                        class="w-full p-3 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="75001"
                      />
                    </div>
                    <div class="space-y-1">
                      <label
                        class="text-xs font-bold text-neutral-500 uppercase"
                        >Ville</label
                      >
                      <input
                        v-model="shipping.city"
                        type="text"
                        class="w-full p-3 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Paris"
                      />
                    </div>
                  </div>

                  <div class="space-y-1">
                    <label class="text-xs font-bold text-neutral-500 uppercase"
                      >Pays</label
                    >
                    <select
                      v-model="shipping.country"
                      class="w-full p-3 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                      <option value="FR">France</option>
                      <option value="BE">Belgique</option>
                      <option value="CH">Suisse</option>
                      <option value="CA">Canada</option>
                    </select>
                  </div>
                </div>
              </div>

              <div v-else-if="currentStep === 5" key="step5" class="space-y-6">
                <div class="text-center space-y-2 mb-6">
                  <h3 class="text-2xl font-bold text-neutral-900">
                    Récapitulatif
                  </h3>
                  <p class="text-neutral-500">
                    Un dernier coup d'œil avant l'impression.
                  </p>
                </div>

                <div
                  class="bg-neutral-900 text-white p-6 rounded-2xl flex justify-between items-center shadow-lg shadow-neutral-900/10"
                >
                  <div>
                    <p class="text-neutral-400 text-sm">Total à payer</p>
                    <p class="text-3xl font-black">{{ formattedTotalPrice }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-neutral-400">TVA incluse</p>
                    <p class="text-xs text-neutral-500">
                      Livraison calculée à l'étape suivante
                    </p>
                  </div>
                </div>

                <div
                  class="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100 shadow-sm mt-4"
                >
                  <div class="p-4 flex justify-between items-center">
                    <span
                      class="text-sm text-neutral-500 flex items-center gap-2"
                      ><Book :size="14" /> Couverture</span
                    >
                    <span class="font-medium text-neutral-900">{{
                      getOptionName(coverOptions, orderConfig.coverType)
                    }}</span>
                  </div>
                  <div class="p-4 flex justify-between items-center">
                    <span
                      class="text-sm text-neutral-500 flex items-center gap-2"
                      ><Scroll :size="14" /> Papier</span
                    >
                    <span class="font-medium text-neutral-900">{{
                      getOptionName(paperOptions, orderConfig.paperType)
                    }}</span>
                  </div>
                  <div class="p-4 flex justify-between items-center">
                    <span
                      class="text-sm text-neutral-500 flex items-center gap-2"
                      ><MapPin :size="14" /> Livraison</span
                    >
                    <span
                      class="font-medium text-neutral-900 text-right text-sm"
                    >
                      {{ shipping.name }}<br />
                      {{ shipping.city }} ({{ shipping.country }})
                    </span>
                  </div>
                </div>

                <div
                  v-if="errorMsg"
                  class="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100"
                >
                  {{ errorMsg }}
                </div>
              </div>
            </Transition>
          </div>

          <div
            class="p-6 border-t border-neutral-100 bg-white flex justify-between items-center z-10"
          >
            <button
              v-if="currentStep > 1"
              @click="currentStep--"
              class="px-6 py-2.5 rounded-lg text-neutral-600 font-medium hover:bg-neutral-100 transition-colors flex items-center gap-2"
            >
              <MoveLeft :size="18" /> Retour
            </button>
            <div v-else></div>

            <button
              v-if="currentStep < totalSteps"
              @click="currentStep++"
              :disabled="!canProceed"
              class="px-6 py-2.5 rounded-lg bg-neutral-900 text-white font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-neutral-900/20"
            >
              Suivant <MoveRight :size="18" />
            </button>

            <button
              v-else
              @click="createOrder"
              :disabled="isLoading"
              class="px-8 py-2.5 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all flex items-center gap-2 shadow-lg shadow-orange-600/20 active:scale-95 disabled:opacity-70 disabled:cursor-wait"
            >
              <Loader2 v-if="isLoading" class="animate-spin" :size="18" />
              <span v-else>Commander & Payer</span>
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="isSuccess"
        class="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 text-center"
      >
        <div
          class="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce"
        >
          <CheckCircle2 :size="40" />
        </div>

        <h3 class="text-3xl font-black text-neutral-900 mb-2">
          C'est commandé !
        </h3>
        <p class="text-neutral-500 max-w-sm mb-8">
          Votre carnet est en route vers nos imprimantes. Vous recevrez un email
          de confirmation d'ici quelques instants.
        </p>

        <div class="w-full space-y-3">
          <UiButton
            to="/dashboard"
            @click="$emit('close')"
            class="w-fit"
            variant="outline"
          >
            Retour au tableau de bord
          </UiButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import {
  MoveRight,
  MoveLeft,
  X,
  CheckCircle2,
  Book,
  BookOpen,
  Scroll,
  Sparkles,
  Gem,
  MapPin,
  Loader2,
} from "lucide-vue-next";

const props = defineProps<{
  isOpen?: boolean;
  pdfUrl?: string | null;
}>();
const emit = defineEmits(["close", "orderCreated"]);

const currentStep = ref(1);
const totalSteps = 5;
const isLoading = ref(false);
const errorMsg = ref<string | null>(null);
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const isSuccess = ref(false);

const orderConfig = reactive({
  coverType: null as string | null,
  paperType: null as string | null,
  finishType: null as string | null,
  quantity: 1,
  format: "A5",
});

const shipping = reactive({
  name: "",
  line1: "",
  line2: "",
  city: "",
  postalCode: "",
  country: "FR",
});

const coverOptions = [
  {
    id: "hardcover",
    name: "Couverture Rigide",
    description: "Robuste et élégant.",
    icon: Book,
    price: 25,
  },
  {
    id: "softcover",
    name: "Couverture Souple",
    description: "Léger et flexible.",
    icon: BookOpen,
    price: 15,
  },
];

const paperOptions = [
  {
    id: "standard_matte",
    name: "Standard Mat",
    description: "Rendu naturel.",
    icon: Scroll,
    price: 0,
  },
  {
    id: "premium_silk",
    name: "Premium Silk",
    description: "Toucher soyeux.",
    icon: Gem,
    price: 5,
  },
];

const finishOptions = [
  {
    id: "matte",
    name: "Lamination Mate",
    description: "Moderne.",
    icon: Sparkles,
  },
  {
    id: "glossy",
    name: "Lamination Brillante",
    description: "Éclatant.",
    icon: Sparkles,
  },
];

const totalPrice = computed(() => {
  let total = 0;
  const cover = coverOptions.find((c) => c.id === orderConfig.coverType);
  if (cover) total += cover.price;

  const paper = paperOptions.find((p) => p.id === orderConfig.paperType);
  if (paper) total += paper.price;

  return total * orderConfig.quantity;
});

const formattedTotalPrice = computed(() => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(totalPrice.value);
});

const canProceed = computed(() => {
  if (currentStep.value === 1) return !!orderConfig.coverType;
  if (currentStep.value === 2) return !!orderConfig.paperType;
  if (currentStep.value === 3) return !!orderConfig.finishType;
  if (currentStep.value === 4) {
    return (
      shipping.name.length > 2 &&
      shipping.line1.length > 5 &&
      shipping.city.length > 2 &&
      shipping.postalCode.length > 4
    );
  }
  return true;
});

const getOptionName = (options: any[], id: string | null) => {
  return options.find((o) => o.id === id)?.name || "Non défini";
};

const createOrder = async () => {
  isSuccess.value = true;
  // if (!props.pdfUrl) {
  //   errorMsg.value = "Erreur: Le PDF n'a pas été généré.";
  //   return;
  // }

  // isLoading.value = true;
  // errorMsg.value = null;

  // try {
  //   const payload = {
  //     amountTotal: Math.round(totalPrice.value * 100),
  //     currency: "eur",
  //     quantity: orderConfig.quantity,
  //     printOptions: { ...orderConfig },
  //     pdfUrl: props.pdfUrl,
  //     shippingAddress: { ...shipping },
  //   };

  //   const response = await $fetch("/orders", {
  //     method: "POST",
  //     baseURL: apiBase,
  //     headers: {
  //       Authorization: `Bearer ${authStore.accessToken}`,
  //     },
  //     body: payload,
  //     credentials: "include",
  //   });

  //   console.log("Commande enregistrée avec succès:", response);

  //   if (response.checkoutUrl) {
  //     window.location.href = response.checkoutUrl;
  //   } else {
  //     emit("orderCreated", response);
  //     emit("close");
  //   }
  // } catch (err: any) {
  //   console.error("Erreur API Orders:", err);

  //   const message = err.data?.message || "Erreur lors de la commande";
  //   errorMsg.value = Array.isArray(message) ? message[0] : message;
  // } finally {
  //   isLoading.value = false;
  // }
};
</script>
