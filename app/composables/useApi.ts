export const $api = <T>(endpoint: string, options: any = {}) => {
  const auth = useAuthStore(); // Ou votre logique de store
  const config = useRuntimeConfig();

  return $fetch<T>(endpoint, {
    baseURL: config.public.apiBase,
    ...options,
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      ...options.headers,
    },
    credentials: "include",
  });
};

// export const useApi = () => {
//   const authStore = useAuthStore();
//   const apiBase = useRuntimeConfig().public.apiBase;

//   return $fetch.create({
//     baseURL: apiBase,
//     async onRequest({ options }) {
//       if (authStore.accessToken) {
//         options.headers = {
//           ...options.headers,
//           //@ts-ignore
//           Authorization: `Bearer ${authStore.accessToken}`,
//         };
//       }
//     },
//     async onResponseError({ response, options }) {
//       if (response.status === 401) {
//         try {
//           const data = await $fetch("/auth/refresh", {
//             method: "POST",
//             baseURL: apiBase,
//             credentials: "include",
//           });

//           if (!data) authStore.logout();

//           authStore.setAuth({
//             ...authStore.user,
//             //@ts-ignore
//             access_token: data.access_token,
//           });
//         } catch (refreshError) {
//           authStore.logout();
//         }
//       }
//     },
//   });
// };
