import type { Category } from "./category";

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  steps: string[];
  servings: number;
  prep_time: number;
  cook_time: number;
  image_url?: string | null;
  cloudinaryPublicId?: string | null;
  isPublic: boolean;

  userId: string;
  categoryId?: string | null;
  category?: Category | null;

  createdAt: string;
  updatedAt: string;
}
