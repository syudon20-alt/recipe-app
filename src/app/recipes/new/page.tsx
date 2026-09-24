"use client";

import { useRouter } from "next/navigation";
import RecipeForm from "@/components/RecipeForm";
import { supabase } from "@/lib/supabaseClient";
import type { RecipeInput } from "@/types/recipe";

export default function NewRecipePage() {
  const router = useRouter();

  async function handleCreate(value: RecipeInput) {
    const { data, error } = await supabase
      .from("recipes")
      .insert(value)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    router.push(`/recipes/${data.id}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">レシピを追加</h1>
      <RecipeForm submitLabel="保存する" onSubmit={handleCreate} />
    </div>
  );
}
