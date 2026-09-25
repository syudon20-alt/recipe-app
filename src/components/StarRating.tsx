"use client";

export default function StarRating({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(value === star ? null : star)}
          className="text-2xl leading-none"
          aria-label={`${star}つ星`}
        >
          <span className={value != null && star <= value ? "text-yellow-400" : "text-gray-300"}>
            ★
          </span>
        </button>
      ))}
      {value != null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-2 text-xs text-gray-400 hover:text-gray-600"
        >
          未評価に戻す
        </button>
      )}
    </div>
  );
}
