"use client";

import { useState } from "react";
import type { Ingredient, RecipeInput } from "@/types/recipe";

type Props = {
  initialValue?: RecipeInput;
  submitLabel: string;
  onSubmit: (value: RecipeInput) => Promise<void>;
};

const emptyIngredient: Ingredient = { name: "", amount: "" };

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

export default function RecipeForm({
  initialValue,
  submitLabel,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [category, setCategory] = useState(initialValue?.category ?? "");
  const [servings, setServings] = useState(initialValue?.servings ?? "");
  const [cookingTime, setCookingTime] = useState(
    initialValue?.cooking_time_minutes != null
      ? String(initialValue.cooking_time_minutes)
      : ""
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialValue?.ingredients && initialValue.ingredients.length > 0
      ? initialValue.ingredients
      : [{ ...emptyIngredient }]
  );
  const [steps, setSteps] = useState<string[]>(
    initialValue?.steps && initialValue.steps.length > 0
      ? initialValue.steps
      : [""]
  );
  const [memo, setMemo] = useState(initialValue?.memo ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateIngredient(index: number, field: keyof Ingredient, value: string) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, { ...emptyIngredient }]);
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function updateStep(index: number, value: string) {
    setSteps((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function addStep() {
    setSteps((prev) => [...prev, ""]);
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("レシピ名を入力してください");
      return;
    }

    const cleanedIngredients = ingredients
      .map((ing) => ({ name: ing.name.trim(), amount: ing.amount.trim() }))
      .filter((ing) => ing.name !== "" || ing.amount !== "");

    const cleanedSteps = steps.map((s) => s.trim()).filter((s) => s !== "");

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        category: category.trim() || null,
        servings: servings.trim() || null,
        cooking_time_minutes: cookingTime.trim()
          ? Number(cookingTime)
          : null,
        ingredients: cleanedIngredients,
        steps: cleanedSteps,
        memo: memo.trim() || null,
      });
    } catch (err) {
      setError("保存に失敗しました: " + extractErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          レシピ名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          placeholder="例: 肉じゃが"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            placeholder="例: 主菜"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            人数・分量
          </label>
          <input
            type="text"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            placeholder="例: 2人分"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            調理時間（分）
          </label>
          <input
            type="number"
            min={0}
            value={cookingTime}
            onChange={(e) => setCookingTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            placeholder="例: 30"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            材料
          </label>
          <button
            type="button"
            onClick={addIngredient}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            ＋ 材料を追加
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)}
                placeholder="材料名"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              <input
                type="text"
                value={ing.amount}
                onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                placeholder="分量"
                className="w-28 rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                disabled={ingredients.length === 1}
                className="px-2 text-gray-400 hover:text-red-500 disabled:opacity-30"
                aria-label="材料を削除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            手順
          </label>
          <button
            type="button"
            onClick={addStep}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            ＋ 手順を追加
          </button>
        </div>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-2 text-sm text-gray-400 w-5 text-right shrink-0">
                {i + 1}.
              </span>
              <textarea
                value={step}
                onChange={(e) => updateStep(i, e.target.value)}
                placeholder={`手順 ${i + 1}`}
                rows={2}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              <button
                type="button"
                onClick={() => removeStep(i)}
                disabled={steps.length === 1}
                className="mt-2 px-2 text-gray-400 hover:text-red-500 disabled:opacity-30"
                aria-label="手順を削除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メモ
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          placeholder="コツやアレンジなど自由にメモできます"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-orange-500 px-4 py-2.5 font-medium text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        {submitting ? "保存中..." : submitLabel}
      </button>
    </form>
  );
}
