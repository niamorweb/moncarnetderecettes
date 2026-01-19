<script setup lang="ts">
interface Props {
  class?: string;
}
const props = withDefaults(defineProps<Props>(), {
  class: "",
});

const baseStyle =
  "bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] md:shadow-xl outline outline-neutral-100";

const fullClass = computed(() => {
  return [baseStyle, props.class].join(" ");
});
</script>

<template>
  <div :class="fullClass">
    <slot />
  </div>
</template>
