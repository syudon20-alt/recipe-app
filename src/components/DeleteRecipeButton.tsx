"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DeleteRecipeButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "このレシピを削除します。よろしいですか？（元に戻せません）"
    );
    if (!confirmed) return;

    setDeleting(true);
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) {
      alert("削除に失敗しました: " + error.message);
      setDeleting(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
    >
      {deleting ? "削除中..." : "削除する"}
    </button>
  );
}
