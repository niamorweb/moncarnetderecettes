<script setup lang="ts">
import { Trash2 } from "lucide-vue-next";

interface Props {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "warning";
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: "Confirmer",
  variant: "danger",
});

const emit = defineEmits(["close", "confirm"]);
</script>

<template>
  <div to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
          @click="emit('close')"
        />

        <div
          class="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 transition-all"
        >
          <div class="text-center">
            <div
              :class="[
                'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6',
                variant === 'danger'
                  ? 'bg-red-50 text-red-500'
                  : 'bg-orange-50 text-orange-500',
              ]"
            >
              <Trash2 class="size-8" />
            </div>

            <h3 class="text-2xl font-extrabold text-neutral-900 mb-2">
              {{ title }}
            </h3>
            <p class="text-neutral-500 mb-8 leading-relaxed">
              {{ description }}
            </p>

            <div class="flex flex-col sm:flex-row gap-3">
              <UiButton
                class="flex-1"
                variant="outline"
                type="button"
                @click="emit('close')"
              >
                Annuler
              </UiButton>
              <UiButton
                type="button"
                @click="emit('confirm')"
                :class="[
                  'flex-1 text-white font-bold rounded-2xl shadow-lg transition-all',
                  variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-100'
                    : 'bg-neutral-900 hover:bg-neutral-800 shadow-neutral-100',
                ]"
              >
                {{ confirmLabel }}
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Animation de la modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .relative {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-enter-from .relative {
  transform: scale(0.9) translateY(10px);
  opacity: 0;
}
</style>
