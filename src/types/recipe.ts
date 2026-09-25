export type Ingredient = {
  name: string;
  amount: string;
};

export type Recipe = {
  id: string;
  title: string;
  category: string | null;
  servings: string | null;
  cooking_time_minutes: number | null;
  ingredients: Ingredient[];
  steps: string[];
  memo: string | null;
  delegate_steps: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
};

export type RecipeInput = {
  title: string;
  category: string | null;
  servings: string | null;
  cooking_time_minutes: number | null;
  ingredients: Ingredient[];
  steps: string[];
  memo: string | null;
  delegate_steps: string | null;
  rating: number | null;
};
