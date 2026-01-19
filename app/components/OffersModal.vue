<script setup lang="ts">
import {
  Check,
  X,
  Crown,
  Globe,
  Zap,
  Search,
  BookOpen,
  Lock,
  Star,
  ScanText,
} from "lucide-vue-next";

interface Props {
  isOpen: boolean;
  isPremium: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["close", "upgrade", "cancel-subscription"]);

const plans = [
  {
    name: "Premium",
    price: "4.99",
    description: "Partagez votre passion avec le monde entier.",
    features: [
      { text: "Tout de l'offre gratuite", active: true },
      {
        text: "Outil IA permettant d'importer des recettes via des scans de photo",
        active: true,
        icon: ScanText,
      },
      { text: "Profil Public Personnalisé", active: true, icon: Globe },
      { text: "SEO (Indexation Google)", active: true, icon: Search },
      { text: "Lien court moncarnet.app/u/toi", active: true, icon: Zap },
    ],
    variant: "premium",
    button: props.isPremium ? "Plan actuel" : "Devenir Premium",
  },
  {
    name: "Gratuit",
    price: "0",
    description: "L'essentiel pour cuisiner sereinement.",
    features: [
      { text: "Recettes illimitées", active: true },
      { text: "Espace personnel sécurisé", active: true },
      { text: "Export Carnet Physique (Payant)", active: true },
    ],
    variant: "ghost",
    button: props.isPremium ? "Revenir au plan gratuit" : "Plan actuel",
  },
];
</script>

<template>
  <div to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="fixed overflow-hidden inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div
          class="fixed inset-0 bg-neutral-900/60 overflow-hidden backdrop-blur-md"
          @click="emit('close')"
        />

        <div
          class="relative h-[80vh] overflow-auto bg-neutral-50 rounded-[3rem] shadow-2xl max-w-4xl w-full transition-all"
        >
          <button
            @click="emit('close')"
            class="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-200 text-neutral-400 transition-colors z-20"
          >
            <X class="size-6" />
          </button>

          <div class="grid grid-cols-1 lg:grid-cols-12">
            <div
              class="lg:col-span-4 p-8 lg:p-12 bg-white flex flex-col justify-center"
            >
              <div
                class="bg-orange-100 text-orange-600 p-3 rounded-2xl w-fit mb-6"
              >
                <Crown class="size-8" />
              </div>
              <h3
                class="text-3xl font-black text-neutral-900 mb-4 leading-tight"
              >
                Passez au niveau <span class="text-orange-500">supérieur.</span>
              </h3>
              <p class="text-neutral-500 font-medium">
                Débloquez le plein potentiel de votre cuisine et rejoignez notre
                communauté de passionnés.
              </p>
            </div>

            <div
              class="lg:col-span-8 p-6 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div
                v-for="plan in plans"
                :key="plan.name"
                :class="[
                  'relative p-8 rounded-[2rem] flex flex-col transition-all',
                  plan.variant === 'premium'
                    ? 'bg-white shadow-xl ring-2 ring-orange-500'
                    : 'bg-neutral-100/50 border border-neutral-200',
                ]"
              >
                <div
                  v-if="plan.variant === 'premium'"
                  class="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                >
                  Recommandé
                </div>

                <div class="mb-6">
                  <h4 class="text-xl font-black text-neutral-900">
                    {{ plan.name }}
                  </h4>
                  <div class="flex items-baseline gap-1 mt-2">
                    <span class="text-3xl font-black">{{ plan.price }}€</span>
                    <span
                      v-if="plan.price !== '0'"
                      class="text-neutral-400 text-sm font-bold"
                      >/ mois</span
                    >
                  </div>
                </div>

                <ul class="space-y-4 mb-8 flex-1">
                  <li
                    v-for="feature in plan.features"
                    :key="feature.text"
                    class="flex items-start gap-3 text-sm"
                  >
                    <component
                      :is="feature.active ? feature.icon || Check : X"
                      :class="[
                        feature.active ? 'text-orange-500' : 'text-neutral-300',
                      ]"
                      class="size-5 shrink-0 mt-0.5"
                    />
                    <span
                      :class="[
                        feature.active
                          ? 'text-neutral-700 font-bold'
                          : 'text-neutral-400 font-medium line-through',
                      ]"
                    >
                      {{ feature.text }}
                    </span>
                  </li>
                </ul>

                <UiButton
                  @click="
                    plan.variant === 'premium'
                      ? isPremium
                        ? emit('close')
                        : emit('upgrade')
                      : isPremium
                      ? emit('cancel-subscription')
                      : emit('close')
                  "
                  :variant="
                    plan.variant === 'premium'
                      ? isPremium
                        ? 'outline'
                        : 'primary'
                      : 'outline'
                  "
                  class="w-full !rounded-2xl !py-4"
                >
                  {{ plan.button }}
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
