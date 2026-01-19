<script setup lang="ts">
import { ForkKnife, Users, Check } from "lucide-vue-next";

import type { Recipe } from "@/types/models/recipe";

// Définition des props

defineProps<{
  recipe: Recipe;

  index: number;

  isSelected: boolean;

  isAnySelected: boolean;
}>();

// Définition des événements

defineEmits(["toggle"]);
</script>

<template>
  <div
    tabindex="0"
    @click="$emit('toggle', recipe.id)"
    @keydown.enter.prevent="$emit('toggle', recipe.id)"
    @keydown.space.prevent="$emit('toggle', recipe.id)"
    :class="[
      'group relative bg-white border-2 rounded-[2rem] overflow-hidden transition-all h-fit duration-300 cursor-pointer outline-none',

      'focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',

      isSelected
        ? 'border-orange-500 shadow-orange-100 shadow-xl scale-[0.98]'
        : 'border-transparent shadow-sm hover:border-neutral-200',
    ]"
  >
    <div
      :class="[
        'absolute top-4 right-4 z-10 size-8 md:size-6 rounded-full border-2 flex items-center justify-center transition-all',

        isSelected
          ? 'bg-orange-500 border-orange-500'
          : 'bg-white/80 border-neutral-200 backdrop-blur-md ',
      ]"
    >
      <Check v-if="isSelected" :size="14" class="text-white" />
    </div>

    <div class="relative h-48 bg-neutral-100 overflow-hidden">
      <NuxtImg
        v-if="recipe.image_url"
        :src="recipe.image_url"
        class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
      />
      <div
        v-else
        class="object-cover w-full h-full bg-neutral-800 transition-transform duration-700 group-hover:scale-110"
      ></div>
    </div>

    <div class="p-5">
      <span
        v-if="recipe.category"
        class="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1 block"
      >
        {{ recipe.category && recipe.category.name }}
      </span>

      <h3
        class="font-bold text-neutral-800 line-clamp-1 mb-3 group-hover:text-orange-600 transition-colors"
      >
        {{ recipe.name }}
      </h3>

      <div class="flex items-center gap-3 text-neutral-400">
        <div class="flex items-center gap-1 text-xs font-bold">
          <ForkKnife :size="14" />

          {{ (recipe.prep_time || 0) + (recipe.cook_time || 0) }}m
        </div>

        <div
          v-if="recipe.servings"
          class="flex items-center gap-1 text-xs font-bold"
        >
          <Users :size="14" /> {{ recipe.servings }}
        </div>
      </div>
    </div>

    <NuxtLink
      v-if="!isAnySelected"
      :to="`/view-recipe/${recipe.id}`"
      class="absolute inset-0 z-0"
      @click.stop
    />
  </div>
</template>
