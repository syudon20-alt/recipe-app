"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Recipe } from "@/types/recipe";

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("すべて");

  useEffect(() => {
    let ignore = false;

    async function fetchRecipes() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false });

      if (ignore) return;

      if (error) {
        setError("レシピの取得に失敗しました: " + error.message);
      } else {
        setRecipes((data ?? []) as Recipe[]);
      }
      setLoading(false);
    }

    fetchRecipes();
    return () => {
      ignore = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return ["すべて", ...Array.from(set).sort()];
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchesKeyword = r.title
        .toLowerCase()
        .includes(keyword.trim().toLowerCase());
      const matchesCategory =
        category === "すべて" || r.category === category;
      return matchesKeyword && matchesCategory;
    });
  }, [recipes, keyword, category]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="レシピ名で検索"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                  category === c
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-600 border-gray-300 hover:border-orange-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <p className="text-gray-500">読み込み中...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && filteredRecipes.length === 0 && (
        <p className="text-gray-500">
          レシピが見つかりません。「＋ 新規追加」から登録してみましょう。
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredRecipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.id}`}
            className="block rounded-xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-orange-300 transition-all"
          >
            <h2 className="font-semibold text-gray-800 truncate">
              {recipe.title}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
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
          </Link>
        ))}
      </div>
    </div>
  );
}
