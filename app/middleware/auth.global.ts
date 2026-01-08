// middleware/auth.global.ts
import { jwtDecode } from "jwt-decode";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();

  const publicPages = ["/login", "/signup", "/", "/forgot-password"];
  const path = to.path.replace(/\/$/, "") || "/";
  const isPublicPage = publicPages.includes(path);

  if (to.path.startsWith("/u/")) {
    return;
  }

  if (to.path.startsWith("/auth/verify")) {
    return;
  }

  if (to.path.startsWith("/confirm-your-email")) {
    return;
  }

  // 1. Déjà authentifié dans Pinia
  if (authStore.isAuthenticated) {
    if (path === "/login" || path === "/signup")
      return navigateTo("/dashboard");
    return;
  }

  // 2. Gestion du Refresh au premier chargement (Client-side)
  if (import.meta.client) {
    try {
      const res = await $fetch<{ access_token: string; userId: string }>(
        "/auth/refresh",
        {
          baseURL: config.public.apiBase,
          method: "POST",
          credentials: "include",
        }
      );

      // Extraction des données du token pour ne rien perdre (isEmailVerified, etc.)
      const decoded: any = jwtDecode(res.access_token);

      authStore.setAuth(res.access_token, {
        id: decoded.sub,
        email: decoded.email,
        username: decoded.username,
        isEmailVerified: decoded.isEmailVerified,
        isPremium: decoded.isPremium,
      });

      if (path === "/login" || path === "/signup")
        return navigateTo("/dashboard");
    } catch (err) {
      // Échec du refresh : on nettoie le store au cas où
      authStore.logout();
      if (!isPublicPage) return navigateTo("/login");
    }
  }

  // 3. Protection SSR (Attention : soyons prudents ici)
  // On ne redirige en SSR QUE si on est SR que l'utilisateur n'a pas de session.
  // Note: En SSR pur, on n'a pas accès aux cookies HttpOnly facilement sans plugin spécifique.
  if (import.meta.server && !isPublicPage && !authStore.isAuthenticated) {
    // Optionnel: On peut laisser passer le SSR et laisser le Client (point 2)
    // décider s'il faut rediriger après le refresh, pour éviter les faux positifs.
  }
});
