// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: true,

  routeRules: {
    // La page d'accueil reste en SSR pour le SEO
    "/": { ssr: true },
    // TOUTES les autres pages passent en mode client
    "/**": { ssr: false },
  },
  modules: ["@nuxt/image", "@nuxtjs/tailwindcss", "@pinia/nuxt"],
  runtimeConfig: {
    public: {
      apiBase: "",
    },
  },
  app: {},
  devtools: { enabled: true },
});
