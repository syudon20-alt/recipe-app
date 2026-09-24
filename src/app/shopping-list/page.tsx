"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ShoppingListItem } from "@/types/shoppingList";

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [adding, setAdding] = useState(false);

  async function fetchItems() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("shopping_list_items")
      .select("*")
      .order("checked", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setError("買い出しリストの取得に失敗しました: " + error.message);
    } else {
      setItems((data ?? []) as ShoppingListItem[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("shopping_list_items")
        .select("*")
        .order("checked", { ascending: true })
        .order("created_at", { ascending: true });

      if (ignore) return;

      if (error) {
        setError("買い出しリストの取得に失敗しました: " + error.message);
      } else {
        setItems((data ?? []) as ShoppingListItem[]);
      }
      setLoading(false);
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);
    const { error } = await supabase.from("shopping_list_items").insert({
      name: name.trim(),
      amount: amount.trim() || null,
    });

    if (error) {
      alert("追加に失敗しました: " + error.message);
    } else {
      setName("");
      setAmount("");
      await fetchItems();
    }
    setAdding(false);
  }

  async function toggleChecked(item: ShoppingListItem) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i))
    );
    const { error } = await supabase
      .from("shopping_list_items")
      .update({ checked: !item.checked })
      .eq("id", item.id);
    if (error) {
      alert("更新に失敗しました: " + error.message);
      fetchItems();
    }
  }

  async function deleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .eq("id", id);
    if (error) {
      alert("削除に失敗しました: " + error.message);
      fetchItems();
    }
  }

  async function clearChecked() {
    const checkedIds = items.filter((i) => i.checked).map((i) => i.id);
    if (checkedIds.length === 0) return;
    const confirmed = window.confirm(
      `購入済みの${checkedIds.length}件を削除します。よろしいですか？`
    );
    if (!confirmed) return;

    setItems((prev) => prev.filter((i) => !i.checked));
    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .in("id", checkedIds);
    if (error) {
      alert("削除に失敗しました: " + error.message);
      fetchItems();
    }
  }

  const hasChecked = items.some((i) => i.checked);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">買い出しリスト</h1>
        {hasChecked && (
          <button
            onClick={clearChecked}
            className="text-sm text-red-500 hover:text-red-600"
          >
            購入済みを削除
          </button>
        )}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="品目を追加"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="分量"
          className="w-24 rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
        <button
          type="submit"
          disabled={adding || !name.trim()}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          追加
        </button>
      </form>

      {loading && <p className="text-gray-500">読み込み中...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-gray-500">
          買い出しリストは空です。レシピ詳細から材料を追加するか、上のフォームから直接追加できます。
        </p>
      )}

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl bg-white border border-gray-200 px-4 py-3"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleChecked(item)}
              className="h-5 w-5 accent-orange-500 shrink-0"
            />
            <div
              className={`flex-1 flex justify-between gap-2 ${
                item.checked ? "line-through text-gray-400" : "text-gray-700"
              }`}
            >
              <span>{item.name}</span>
              {item.amount && <span className="text-sm">{item.amount}</span>}
            </div>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-gray-400 hover:text-red-500 shrink-0"
              aria-label="削除"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
