"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";
import AddToShoppingListButton from "@/components/AddToShoppingListButton";
import type { Recipe } from "@/types/recipe";

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{recipe.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
            {recipe.category && (
              <span className="rounded-full bg-orange-100 text-orange-700 px-2 py-0.5">
                {recipe.category}
              </span>
            )}
            {recipe.cooking_time_minutes != null && (
              <span>⏱ {recipe.cooking_time_minutes}分</span>
            )}
            {recipe.servings && <span>👥 {recipe.servings}</span>}
          </div>
          {recipe.rating != null && (
            <div className="mt-2 text-yellow-400" aria-label={`評価${recipe.rating}`}>
              {"★".repeat(recipe.rating)}
              <span className="text-gray-300">
                {"★".repeat(5 - recipe.rating)}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="rounded-lg border border-orange-300 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
          >
            編集する
          </Link>
          <DeleteRecipeButton id={recipe.id} />
        </div>
      </div>

      {recipe.ingredients.length > 0 && (
        <section className="rounded-xl bg-white border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">材料</h2>
            <AddToShoppingListButton ingredients={recipe.ingredients} />
          </div>
          <ul className="space-y-1.5">
            {recipe.ingredients.map((ing, i) => (
              <li
                key={i}
                className="flex justify-between border-b border-dashed border-gray-100 pb-1.5 last:border-0 last:pb-0"
              >
                <span className="text-gray-700">{ing.name}</span>
                <span className="text-gray-500">{ing.amount}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recipe.steps.length > 0 && (
        <section className="rounded-xl bg-white border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">手順</h2>
          <ol className="space-y-3">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-gray-700 whitespace-pre-wrap">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {recipe.memo && (
        <section className="rounded-xl bg-white border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-2">メモ</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{recipe.memo}</p>
        </section>
      )}

      {recipe.delegate_steps && (
        <section className="rounded-xl bg-white border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-2">嫁さん用作業工程</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {recipe.delegate_steps}
          </p>
        </section>
      )}

      <Link href="/" className="inline-block text-orange-600 hover:underline">
        ← 一覧に戻る
      </Link>
    </div>
  );
}
