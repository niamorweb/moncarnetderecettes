<script setup lang="ts">
import { Utensils, ChefHat, Timer, Users } from "lucide-vue-next";
import type { Recipe } from "@/types/models/recipe";

interface Props {
  recipe: Recipe | null;
}

const props = defineProps<Props>();

const colors = {
  primary: "#f97316", // Orange vif
  secondary: "#FFD600", // Jaune "Pop"
  background: "#FFFBF0", // Crème (plus chaleureux que blanc)
  text: "#1A1A1A",
  card: "#FFFFFF",
  border: "#1A1A1A",
};
</script>

<template>
  <div
    v-if="recipe"
    class="pdf-page-container"
    :style="{
      width: '559px',
      height: '794px',
      padding: '30px',
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: 'serif',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <header
      :style="{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        alignItems: 'flex-start',
      }"
    >
      <div
        :style="{
          width: '220px',
          height: '240px',
          backgroundColor: colors.card,
          border: `2px solid ${colors.border}`,
          boxShadow: `6px 6px 0px ${colors.border}`,
          padding: '10px 10px 40px 10px',
          transform: 'rotate(-2deg)',
          flexShrink: 0,
        }"
      >
        <img
          :src="recipe.image_url || '/images/illustration.jpeg'"
          :style="{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            border: `1px solid ${colors.border}`,
          }"
          alt=""
        />
      </div>

      <div :style="{ flex: 1, paddingTop: '10px' }">
        <span
          :style="{
            backgroundColor: colors.secondary,
            padding: '4px 10px',
            fontSize: '10px',
            fontWeight: 'bold',
            border: `1.5px solid ${colors.border}`,
            borderRadius: '20px',
            textTransform: 'uppercase',
          }"
        >
          {{ recipe.category?.name || "Miam !" }}
        </span>

        <h1
          :style="{
            fontSize: '32px',
            lineHeight: '1',
            margin: '15px 0',
            fontFamily: 'Georgia, serif',
            fontWeight: '900',
          }"
        >
          {{ recipe.name }}
        </h1>

        <div :style="{ display: 'flex', gap: '10px' }">
          <div class="info-badge">
            <Timer :size="14" /> {{ recipe.prep_time }}m
          </div>
          <div class="info-badge">
            <Users :size="14" /> {{ recipe.servings }} pers.
          </div>
        </div>
      </div>
    </header>

    <div :style="{ display: 'flex', gap: '25px', flex: 1 }">
      <aside
        :style="{
          width: '180px',
          backgroundColor: '#fff',
          border: `2px solid ${colors.border}`,
          borderRadius: '15px',
          padding: '15px',
          height: 'fit-content',
        }"
      >
        <h2
          :style="{
            fontSize: '16px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }"
        >
          <Utensils :size="16" /> Ingrédients
        </h2>
        <ul
          :style="{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontFamily: 'sans-serif',
          }"
        >
          <li
            v-for="(ing, i) in recipe.ingredients"
            :key="i"
            :style="{
              fontSize: '11px',
              padding: '5px 0',
              borderBottom: '1px dashed #ccc',
              color: '#444',
            }"
          >
            {{ ing }}
          </li>
        </ul>
      </aside>

      <main :style="{ flex: 1 }">
        <h2
          :style="{
            fontSize: '18px',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }"
        >
          <ChefHat :size="18" /> Préparation
        </h2>
        <div :style="{ display: 'flex', flexDirection: 'column', gap: '15px' }">
          <div
            v-for="(step, i) in recipe.steps"
            :key="i"
            :style="{ display: 'flex', gap: '15px' }"
          >
            <div
              :style="{
                minWidth: '28px',
                height: '28px',
                backgroundColor: colors.primary,
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                border: `2px solid ${colors.border}`,
                flexShrink: 0,
              }"
            >
              {{ i + 1 }}
            </div>
            <p
              :style="{
                fontSize: '12px',
                margin: 0,
                lineHeight: '1.4',
                fontFamily: 'sans-serif',
                color: '#333',
              }"
            >
              {{ step }}
            </p>
          </div>
        </div>
      </main>
    </div>

    <div
      :style="{
        position: 'absolute',
        bottom: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        backgroundColor: colors.secondary,
        borderRadius: '50%',
        opacity: 0.5,
        zIndex: 0,
      }"
    ></div>
  </div>
</template>

<style scoped>
.info-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: sans-serif;
  font-size: 11px;
  font-weight: bold;
  background: white;
  padding: 5px 10px;
  border: 1.5px solid #1a1a1a;
  border-radius: 8px;
}

.pdf-page-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
  opacity: 0.4;
  pointer-events: none;
}
</style>
