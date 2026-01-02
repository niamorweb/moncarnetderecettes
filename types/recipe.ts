export interface Category {
  id: string;
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  prep_time: number;
  cook_time: number;
  servings?: number;
  category_id: string | null;
  category_name?: string | null;
  user_id: string;
  ingredients: string[];
  steps: string[];
}
