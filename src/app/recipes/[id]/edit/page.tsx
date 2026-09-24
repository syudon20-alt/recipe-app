"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RecipeForm from "@/components/RecipeForm";
import { supabase } from "@/lib/supabaseClient";
import type { Recipe, RecipeInput } from "@/types/recipe";

export default function EditRecipePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchRecipe() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", params.id)
        .single();

      if (ignore) return;

      if (error) {
        setError("レシピが見つかりませんでした");
      } else {
        setRecipe(data as Recipe);
      }
      setLoading(false);
    }

    fetchRecipe();
    return () => {
      ignore = true;
    };
  }, [params.id]);

  async function handleUpdate(value: RecipeInput) {
    const { error } = await supabase
      .from("recipes")
      .update(value)
      .eq("id", params.id);

    if (error) {
      throw error;
    }

    router.push(`/recipes/${params.id}`);
  }

  if (loading) return <p className="text-gray-500">読み込み中...</p>;
  if (error || !recipe) {
    return (
      <div className="space-y-3">
        <p className="text-red-600">{error ?? "レシピが見つかりませんでした"}</p>
        <Link href="/" className="text-orange-600 hover:underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">レシピを編集</h1>
      <RecipeForm
        submitLabel="更新する"
        initialValue={{
          title: recipe.title,
          category: recipe.category,
          servings: recipe.servings,
          cooking_time_minutes: recipe.cooking_time_minutes,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          memo: recipe.memo,
        }}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
