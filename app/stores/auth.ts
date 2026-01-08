import { defineStore } from "pinia";

interface User {
  id: string;
  username: string;
  email: string;
  isPremium: boolean;
  isEmailVerified: boolean;
  premiumEndsAt: any;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: null as string | null,
    user: null as any | User,
    isAuthenticated: false,
  }),

  actions: {
    setAuth(accessToken: string, user?: any) {
      this.accessToken = accessToken;
      this.user = user ?? null;
      this.isAuthenticated = true;
    },

    logout() {
      this.accessToken = null;
      this.user = null;
      this.isAuthenticated = false;
      navigateTo("/login");
    },
  },
});
