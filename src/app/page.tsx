"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Recipe } from "@/types/recipe";

type SearchMode = "title" | "ingredients";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function isOwned(ingredientName: string, ownedList: string[]) {
  const target = normalize(ingredientName);
  if (!target) return true;
  return ownedList.some((owned) => {
    const o = normalize(owned);
    return o !== "" && (target.includes(o) || o.includes(target));
  });
}

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("すべて");
  const [searchMode, setSearchMode] = useState<SearchMode>("title");
  const [ownedIngredients, setOwnedIngredients] = useState<string[]>([]);
  const [ownedInput, setOwnedInput] = useState("");

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

  function addOwnedIngredient() {
    const value = ownedInput.trim();
    if (!value) return;
    if (!ownedIngredients.some((o) => normalize(o) === normalize(value))) {
      setOwnedIngredients((prev) => [...prev, value]);
    }
    setOwnedInput("");
  }

  function removeOwnedIngredient(value: string) {
    setOwnedIngredients((prev) => prev.filter((o) => o !== value));
  }

  const categoryFiltered = useMemo(() => {
    return recipes.filter(
      (r) => category === "すべて" || r.category === category
    );
  }, [recipes, category]);

  const titleFiltered = useMemo(() => {
    return categoryFiltered.filter((r) =>
      r.title.toLowerCase().includes(keyword.trim().toLowerCase())
    );
  }, [categoryFiltered, keyword]);

  const ingredientRanked = useMemo(() => {
    return categoryFiltered
      .map((r) => {
        const missing = r.ingredients.filter(
          (ing) => !isOwned(ing.name, ownedIngredients)
        ).length;
        return { recipe: r, missing, total: r.ingredients.length };
      })
      .sort((a, b) => {
        if (a.missing !== b.missing) return a.missing - b.missing;
        return a.recipe.title.localeCompare(b.recipe.title, "ja");
      });
  }, [categoryFiltered, ownedIngredients]);

  const displayList: { recipe: Recipe; missing: number | null; total: number }[] =
    searchMode === "title"
      ? titleFiltered.map((r) => ({
          recipe: r,
          missing: null,
          total: r.ingredients.length,
        }))
      : ingredientRanked;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex rounded-lg border border-gray-300 bg-white p-1 text-sm">
          <button
            onClick={() => setSearchMode("title")}
            className={`flex-1 rounded-md py-1.5 transition-colors ${
              searchMode === "title"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:bg-orange-50"
            }`}
          >
            レシピ名で検索
          </button>
          <button
            onClick={() => setSearchMode("ingredients")}
            className={`flex-1 rounded-md py-1.5 transition-colors ${
              searchMode === "ingredients"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:bg-orange-50"
            }`}
          >
            材料から探す
          </button>
        </div>

        {searchMode === "title" ? (
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="レシピ名で検索"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={ownedInput}
                onChange={(e) => setOwnedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOwnedIngredient();
                  }
                }}
                placeholder="持っている材料を入力（例: 卵）"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              <button
                onClick={addOwnedIngredient}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                追加
              </button>
            </div>
            {ownedIngredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ownedIngredients.map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-sm"
                  >
                    {ing}
                    <button
                      onClick={() => removeOwnedIngredient(ing)}
                      className="text-orange-500 hover:text-orange-700"
                      aria-label={`${ing}を削除`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            {ownedIngredients.length === 0 && (
              <p className="text-sm text-gray-400">
                材料を追加すると、足りない材料が少ない順にレシピを並べ替えます。
              </p>
            )}
          </div>
        )}

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

      {!loading && !error && displayList.length === 0 && (
        <p className="text-gray-500">
          レシピが見つかりません。「＋ 新規追加」から登録してみましょう。
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayList.map(({ recipe, missing, total }) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.id}`}
            className="block rounded-xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-orange-300 transition-all"
          >
            <h2 className="font-semibold text-gray-800 truncate">
              {recipe.title}
            </h2>
            {recipe.rating != null && (
              <div className="mt-0.5 text-xs text-yellow-400">
                {"★".repeat(recipe.rating)}
                <span className="text-gray-300">
                  {"★".repeat(5 - recipe.rating)}
                </span>
              </div>
            )}
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
            {searchMode === "ingredients" &&
              ownedIngredients.length > 0 &&
              total > 0 && (
                <div className="mt-2">
                  {missing === 0 ? (
                    <span className="inline-block rounded-full bg-green-100 text-green-700 text-xs px-2 py-0.5">
                      ✅ 材料が揃っています
                    </span>
                  ) : (
                    <span className="inline-block rounded-full bg-gray-100 text-gray-600 text-xs px-2 py-0.5">
                      あと{missing}品
                    </span>
                  )}
                </div>
              )}
          </Link>
        ))}
      </div>
    </div>
  );
}
