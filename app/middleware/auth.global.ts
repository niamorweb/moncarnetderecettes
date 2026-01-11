// // middleware/auth.global.ts
// import { jwtDecode } from "jwt-decode";

// export default defineNuxtRouteMiddleware(async (to, from) => {
//   const authStore = useAuthStore();
//   const config = useRuntimeConfig();

//   const publicPages = ["/login", "/signup", "/", "/forgot-password"];
//   const path = to.path.replace(/\/$/, "") || "/";
//   const isPublicPage = publicPages.includes(path);

//   if (to.path.startsWith("/u/")) {
//     return;
//   }

//   if (to.path.startsWith("/auth/verify")) {
//     return;
//   }

//   if (to.path.startsWith("/confirm-your-email")) {
//     return;
//   }

//   // 1. Déjà authentifié dans Pinia
//   if (authStore.isAuthenticated) {
//     if (path === "/login" || path === "/signup")
//       return navigateTo("/dashboard");
//     return;
//   }

//   // 2. Gestion du Refresh au premier chargement (Client-side)
//   if (import.meta.client) {
//     try {
//       const res = await $fetch<{ access_token: string; userId: string }>(
//         "/auth/refresh",
//         {
//           baseURL: config.public.apiBase,
//           method: "POST",
//           credentials: "include",
//         }
//       );

//       // Extraction des données du token pour ne rien perdre (isEmailVerified, etc.)
//       const decoded: any = jwtDecode(res.access_token);

//       authStore.setAuth(res.access_token, {
//         id: decoded.sub,
//         email: decoded.email,
//         username: decoded.username,
//         isEmailVerified: decoded.isEmailVerified,
//         isPremium: decoded.isPremium,
//       });

//       if (path === "/login" || path === "/signup")
//         return navigateTo("/dashboard");
//     } catch (err) {
//       // Échec du refresh : on nettoie le store au cas où
//       authStore.logout();
//       if (!isPublicPage) return navigateTo("/login");
//     }
//   }

//   // 3. Protection SSR (Attention : soyons prudents ici)
//   // On ne redirige en SSR QUE si on est SR que l'utilisateur n'a pas de session.
//   // Note: En SSR pur, on n'a pas accès aux cookies HttpOnly facilement sans plugin spécifique.
//   if (import.meta.server && !isPublicPage && !authStore.isAuthenticated) {
//     // Optionnel: On peut laisser passer le SSR et laisser le Client (point 2)
//     // décider s'il faut rediriger après le refresh, pour éviter les faux positifs.
//   }
// });

import { jwtDecode } from "jwt-decode";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();

  const publicPages = ["/login", "/signup", "/", "/forgot-password"];
  const path = to.path.replace(/\/$/, "") || "/";
  const isPublicPage = publicPages.includes(path);

  if (to.path.startsWith("/u/")) return;
  if (to.path.startsWith("/auth/verify")) return;
  if (to.path.startsWith("/confirm-your-email")) {
    return;
  }

  // --- BLOC 1 : Déjà authentifié dans Pinia ---
  if (authStore.isAuthenticated) {
    // NOUVEAU : Si l'email n'est pas vérifié, on force la redirection
    if (authStore.user?.isEmailVerified === false) {
      // <--- VÉRIFICATION ICI
      return navigateTo("/confirm-your-email", { external: true });
    }

    if (path === "/login" || path === "/signup")
      return navigateTo("/dashboard", { external: true });

    return;
  }

  // --- BLOC 2 : Gestion du Refresh (Client-side) ---
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

      const decoded: any = jwtDecode(res.access_token);

      authStore.setAuth(res.access_token, {
        id: decoded.sub,
        email: decoded.email,
        username: decoded.username,
        isEmailVerified: decoded.isEmailVerified,
        isPremium: decoded.isPremium,
      });

      // NOUVEAU : Vérification immédiate après le refresh
      // Si le token tout frais dit que ce n'est pas vérifié -> redirection
      if (decoded.isEmailVerified === false) {
        // <--- VÉRIFICATION ICI
        return navigateTo("/confirm-your-email", { external: true });
      }

      if (path === "/login" || path === "/signup")
        return navigateTo("/dashboard", { external: true });
    } catch (err) {
      // Échec du refresh : on nettoie
      authStore.logout();
      if (!isPublicPage) return navigateTo("/login", { external: true });
    }
  }

  // --- BLOC 3 : Protection SSR ---
  if (import.meta.server && !isPublicPage && !authStore.isAuthenticated) {
    // Logique existante...
  }
});
