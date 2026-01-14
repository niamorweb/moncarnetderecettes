<script setup lang="ts">
import { Utensils, ChefHat } from "lucide-vue-next";
import type { Recipe } from "@/types/models/recipe";

interface Props {
  recipe: Recipe | null;
}

const props = defineProps<Props>();

const colors = {
  orange: "#f97316",
  neutral900: "#171717",
  neutral600: "#525252",
  neutral100: "#f5f5f5",
  accent: "#fff7ed",
};

const stepFontSize = "12px";
const stepGap = "12px";
const imageHeight = "180px";
</script>

<template>
  <div
    v-if="recipe"
    class="pdf-page-container"
    :style="{
      width: '559px',
      height: '794px',
      padding: '40px',
      backgroundColor: '#ffffff',
      color: colors.neutral900,
      fontFamily: '\'Helvetica Neue\', Helvetica, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      position: 'relative',
    }"
  >
    <header
      :style="{
        marginBottom: '20px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
      }"
    >
      <div
        :style="{
          width: '200px',
          height: imageHeight,
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: colors.neutral100,
          flexShrink: 0,
        }"
      >
        <img
          :src="recipe.image_url || '/images/illustration.jpeg'"
          :style="{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }"
          crossorigin="anonymous"
          alt=""
        />
      </div>

      <div
        :style="{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '12px',
        }"
      >
        <div>
          <span
            :style="{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: colors.orange,
              fontWeight: '800',
              display: 'block',
              marginBottom: '4px',
            }"
          >
            {{ recipe.category?.name || "Recette Maison" }}
          </span>
          <h1
            :style="{
              fontSize: '20px',
              fontWeight: '900',
              margin: 0,
              lineHeight: '1.2',
              letterSpacing: '-0.5px',
              color: colors.neutral900,
            }"
          >
            {{ recipe.name }}
          </h1>
        </div>

        <div
          :style="{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: colors.neutral100,
            padding: '8px 12px',
            borderRadius: '12px',
            width: 'fit-content',
          }"
        >
          <div :style="{ textAlign: 'left' }">
            <div :style="{ fontSize: '12px', fontWeight: 'bold' }">
              {{ recipe.prep_time ?? "_ " }}m
            </div>
            <div
              :style="{
                fontSize: '8px',
                color: colors.neutral600,
                textTransform: 'uppercase',
                fontWeight: 'bold',
              }"
            >
              Préparation
            </div>
          </div>

          <div
            :style="{
              width: '1px',
              height: '20px',
              backgroundColor: '#d4d4d4',
            }"
          />

          <div :style="{ textAlign: 'left' }">
            <div :style="{ fontSize: '12px', fontWeight: 'bold' }">
              {{ recipe.cook_time ?? "_ " }}m
            </div>
            <div
              :style="{
                fontSize: '8px',
                color: colors.neutral600,
                textTransform: 'uppercase',
                fontWeight: 'bold',
              }"
            >
              Cuisson
            </div>
          </div>

          <div
            :style="{
              width: '1px',
              height: '20px',
              backgroundColor: '#d4d4d4',
            }"
          />

          <div :style="{ textAlign: 'left' }">
            <div :style="{ fontSize: '12px', fontWeight: 'bold' }">
              {{ recipe.servings ?? "_ " }}
            </div>
            <div
              :style="{
                fontSize: '8px',
                color: colors.neutral600,
                textTransform: 'uppercase',
                fontWeight: 'bold',
              }"
            >
              Pers.
            </div>
          </div>
        </div>
      </div>
    </header>

    <div :style="{ display: 'flex', gap: '30px', flex: 1, minHeight: 0 }">
      <div :style="{ width: '160px', flexShrink: 0 }">
        <h2
          :style="{
            fontSize: '12px',
            fontWeight: '900',
            textTransform: 'uppercase',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }"
        >
          <Utensils :size="12" :stroke-width="3" /> Ingrédients
        </h2>
        <div
          :style="{
            backgroundColor: colors.accent,
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #ffedd5',
          }"
        >
          <ul :style="{ listStyle: 'none', padding: 0, margin: 0 }">
            <li
              v-for="(ing, i) in recipe.ingredients"
              :key="i"
              :style="{
                fontSize: '12px',
                lineHeight: '1.4',
                padding: '6px 0',
                borderBottom:
                  i === recipe.ingredients.length - 1
                    ? 'none'
                    : '1px solid #fed7aa',
                color: colors.neutral600,
              }"
            >
              • {{ ing }}
            </li>
          </ul>
        </div>
      </div>

      <div :style="{ flex: 1 }">
        <h2
          :style="{
            fontSize: '12px',
            fontWeight: '900',
            textTransform: 'uppercase',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }"
        >
          <ChefHat :size="12" :stroke-width="3" /> Préparation
        </h2>
        <div
          :style="{ display: 'flex', flexDirection: 'column', gap: stepGap }"
        >
          <div
            v-for="(step, i) in recipe.steps"
            :key="i"
            :style="{ display: 'flex', gap: '12px' }"
          >
            <span
              :style="{
                fontSize: stepFontSize,
                fontWeight: '900',
                color: colors.orange,
                minWidth: '20px',
              }"
            >
              {{ i + 1 }}.
            </span>
            <p
              :style="{
                fontSize: stepFontSize,
                margin: 0,
                lineHeight: '1.5',
                color: colors.neutral600,
              }"
            >
              {{ step }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.pdf-page-container::before {
  content: "";
  absolute: inset 0;
  background-image: url("https://www.transparenttextures.com/patterns/paper-fibers.png");
  opacity: 0.05;
  pointer-events: none;
}
</style>
