"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, calculateExpiryDate } from "@/lib/categories";

export default function AddProductForm() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [openedDate, setOpenedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const category = CATEGORIES.find((c) => c.key === selectedCategory);

  const expiryDate =
    category && openedDate
      ? calculateExpiryDate(new Date(openedDate), category.expiryMonths)
      : null;

  const daysLeft = expiryDate
    ? Math.ceil(
        (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategory || !description.trim() || !openedDate) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          description: description.trim(),
          openedDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Category picker */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Category
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                selectedCategory === cat.key
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="font-medium">{cat.label}</span>
              <span className="block text-xs text-gray-400">
                {cat.expiryMonths}mo
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold mb-2 text-gray-700"
        >
          Description
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., MAC Ruby Woo, travel size"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
        />
      </div>

      {/* Opened date */}
      <div>
        <label
          htmlFor="openedDate"
          className="block text-sm font-semibold mb-2 text-gray-700"
        >
          Date Opened
        </label>
        <input
          id="openedDate"
          type="date"
          value={openedDate}
          onChange={(e) => setOpenedDate(e.target.value)}
          max={today}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
        />
      </div>

      {/* Expiry preview */}
      {expiryDate && (
        <div className="bg-pink-50 rounded-lg p-3 text-sm">
          <p className="text-gray-600">
            Expires on{" "}
            <span className="font-semibold text-gray-900">
              {expiryDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </p>
          {daysLeft !== null && (
            <p className="text-xs text-gray-400 mt-1">
              {daysLeft > 0
                ? `${daysLeft} days from now`
                : daysLeft === 0
                  ? "Expires today"
                  : `Expired ${Math.abs(daysLeft)} days ago`}
            </p>
          )}
          <p className="text-xs text-pink-500 mt-1">
            A calendar reminder will be set for 2 weeks before expiry
          </p>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!selectedCategory || !description.trim() || saving}
        className="bg-pink-600 text-white py-3 rounded-full font-semibold text-sm hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {saving ? "Saving & creating reminder..." : "Save & Set Reminder"}
      </button>
    </form>
  );
}
