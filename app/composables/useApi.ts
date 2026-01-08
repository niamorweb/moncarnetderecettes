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
