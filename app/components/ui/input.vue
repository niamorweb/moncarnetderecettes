<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: any;
    placeholder?: string;
    autocomplete?: string;
    type?: string;
    class?: string;
    isTextArea?: boolean;
    disabled?: boolean;
  }>(),
  {
    type: "text",
    placeholder: "",
    autocomplete: "",
    class: "",
    isTextArea: false,
    disabled: false,
  },
);

const emit = defineEmits(["update:modelValue"]);

const baseClass =
  "w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all";

const computedClass = computed(() => `${baseClass} ${props.class}`.trim());

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement;
  emit("update:modelValue", target.value);
};
</script>

<template>
  <textarea
    v-if="isTextArea"
    :value="modelValue"
    @input="onInput"
    :placeholder="placeholder"
    :class="computedClass"
    :disabled="disabled"
  />
  <input
    v-else
    :value="modelValue"
    @input="onInput"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :type="type"
    :class="computedClass"
    :disabled="disabled"
  />
</template>
