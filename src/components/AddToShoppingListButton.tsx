"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Ingredient } from "@/types/recipe";

export default function AddToShoppingListButton({
  ingredients,
}: {
  ingredients: Ingredient[];
}) {
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (ingredients.length === 0) return;
    setAdding(true);

    const { data: existing, error: fetchError } = await supabase
      .from("shopping_list_items")
      .select("name")
      .eq("checked", false);

    if (fetchError) {
      alert("買い出しリストへの追加に失敗しました: " + fetchError.message);
      setAdding(false);
      return;
    }

    const existingNames = new Set(
      (existing ?? []).map((item) => item.name.trim().toLowerCase())
    );

    const toInsert = ingredients
      .filter((ing) => !existingNames.has(ing.name.trim().toLowerCase()))
      .map((ing) => ({ name: ing.name, amount: ing.amount || null }));

    if (toInsert.length === 0) {
      alert("材料はすべて買い出しリストに追加済みです");
      setAdding(false);
      return;
    }

    const { error } = await supabase
      .from("shopping_list_items")
      .insert(toInsert);

    if (error) {
      alert("買い出しリストへの追加に失敗しました: " + error.message);
    } else {
      alert(`${toInsert.length}件を買い出しリストに追加しました`);
    }
    setAdding(false);
  }

  return (
    <button
      onClick={handleAdd}
      disabled={adding}
      className="text-sm text-orange-600 hover:text-orange-700 disabled:opacity-50"
    >
      🛒 買い出しリストに追加
    </button>
  );
}
