"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CATEGORIES,
  calculateExpiryDate,
  getCategoryByKey,
  resolveKey,
} from "@/lib/categories";
import ExpiryBadge from "./ExpiryBadge";

interface Product {
  id: string;
  category: string;
  description: string;
  color: string | null;
  openedDate: string;
  expiryDate: string;
}

const sortedCategories = [...CATEGORIES].sort((a, b) =>
  a.label.localeCompare(b.label)
);

function getBaseType(label: string): string {
  return label.split(" - ")[0].trim();
}

const FILTER_TYPES = Array.from(
  new Set(CATEGORIES.map((c) => getBaseType(c.label)))
).sort();

export default function DashboardClient({ products }: { products: Product[] }) {
  const router = useRouter();

  // Add form state
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [openedDate, setOpenedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Search and filter state
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editOpenedDate, setEditOpenedDate] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const selectedCategory = CATEGORIES.find((c) => c.key === category);
  const expiryDate =
    selectedCategory && openedDate
      ? calculateExpiryDate(new Date(openedDate), selectedCategory.expiryMonths)
      : null;

  const today = new Date().toISOString().split("T")[0];

  function openEdit(product: Product) {
    setEditingId(product.id);
    setEditCategory(resolveKey(product.category));
    setEditDescription(product.description);
    setEditColor(product.color ?? "");
    setEditOpenedDate(product.openedDate.split("T")[0]);
    setEditError("");
  }

  function closeEdit() {
    setEditingId(null);
    setEditError("");
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editCategory || !editDescription.trim()) return;

    setEditSaving(true);
    setEditError("");

    try {
      const res = await fetch(`/api/products/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: editCategory,
          description: editDescription.trim(),
          color: editColor.trim() || "",
          openedDate: editOpenedDate,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let message = "Failed to update";
        try {
          const data = JSON.parse(text);
          message = data.error || message;
        } catch {
          // not JSON
        }
        throw new Error(message);
      }

      closeEdit();
      router.refresh();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !description.trim()) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description: description.trim(),
          color: color.trim() || undefined,
          openedDate,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let message = "Failed to save";
        try {
          const data = JSON.parse(text);
          message = data.error || message;
        } catch {
          // not JSON
        }
        throw new Error(message);
      }

      setCategory("");
      setDescription("");
      setColor("");
      setOpenedDate(new Date().toISOString().split("T")[0]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      setDeletingId(null);
    }
  }

  // Filter products by search and type filter
  const filtered = products.filter((p) => {
    const cat = getCategoryByKey(p.category);

    if (filterType) {
      const base = cat ? getBaseType(cat.label) : "";
      if (base !== filterType) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !p.description.toLowerCase().includes(q) &&
        !(cat?.label.toLowerCase().includes(q) ?? false) &&
        !(p.color?.toLowerCase().includes(q) ?? false)
      ) {
        return false;
      }
    }

    return true;
  });

  const editSelectedCategory = CATEGORIES.find((c) => c.key === editCategory);
  const editExpiryDate =
    editSelectedCategory && editOpenedDate
      ? calculateExpiryDate(
          new Date(editOpenedDate),
          editSelectedCategory.expiryMonths
        )
      : null;

  return (
    <>
      {/* Add Product Section */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-3 text-cream-700">Add Product</h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cream-200"
              >
                <option value="">Select product type...</option>
                {sortedCategories.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label} ({cat.expiryMonths}mo)
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (e.g., MAC Ruby Woo)"
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cream-200"
              />
            </div>
            <div>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Colour (optional)"
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cream-200"
              />
            </div>
            <div>
              <input
                type="date"
                value={openedDate}
                onChange={(e) => setOpenedDate(e.target.value)}
                max={today}
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cream-200"
              />
            </div>
          </div>

          {expiryDate && (
            <p className="text-xs text-gray-500">
              Expires{" "}
              <span className="font-medium text-gray-700">
                {expiryDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {" — "}calendar reminder will be set 2 weeks before
            </p>
          )}

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={!category || !description.trim() || saving}
            className="bg-cream-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-cream-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Add & Set Reminder"}
          </button>
        </form>
      </section>

      {/* My Products Section */}
      <section>
        <h2 className="text-lg font-bold mb-3 text-cream-700">My Products</h2>

        {products.length > 0 && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cream-200"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-cream-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cream-200"
            >
              <option value="">All types</option>
              {FILTER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

        {filtered.length === 0 && products.length === 0 && (
          <p className="text-center py-8 text-gray-400 text-sm">
            No products yet. Add one above!
          </p>
        )}

        {filtered.length === 0 && products.length > 0 && (
          <p className="text-center py-8 text-gray-400 text-sm">
            No products match your search or filter.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {filtered.map((product) => {
            const cat = getCategoryByKey(product.category);
            const openedStr = new Date(product.openedDate).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric" }
            );
            const expiryStr = new Date(product.expiryDate).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" }
            );

            return (
              <div
                key={product.id}
                onClick={() => openEdit(product)}
                className="bg-white rounded-lg shadow-sm px-3 py-2 flex items-center gap-3 cursor-pointer hover:bg-cream-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.description} · {cat?.label ?? product.category}
                    </p>
                    <ExpiryBadge expiryDate={product.expiryDate} />
                  </div>
                  {product.color && (
                    <p className="text-xs text-gray-500">{product.color}</p>
                  )}
                  <p className="text-[10px] text-gray-400">
                    Opened {openedStr} · Expires {expiryStr}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, product.id)}
                  disabled={deletingId === product.id}
                  className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none disabled:opacity-50 shrink-0"
                  aria-label="Remove product"
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Edit Modal */}
      {editingId && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
          onClick={closeEdit}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-cream-700">
                Edit Product
              </h3>
              <button
                onClick={closeEdit}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Product Type
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cream-200"
                >
                  {sortedCategories.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label} ({cat.expiryMonths}mo)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cream-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Colour (optional)
                </label>
                <input
                  type="text"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cream-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Date Opened
                </label>
                <input
                  type="date"
                  value={editOpenedDate}
                  onChange={(e) => setEditOpenedDate(e.target.value)}
                  max={today}
                  className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cream-200"
                />
              </div>

              {editExpiryDate && (
                <p className="text-xs text-gray-500">
                  Expires{" "}
                  <span className="font-medium text-gray-700">
                    {editExpiryDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </p>
              )}

              {editError && (
                <p className="text-red-500 text-xs">{editError}</p>
              )}

              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-600 border border-cream-200 hover:bg-cream-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !editCategory || !editDescription.trim() || editSaving
                  }
                  className="flex-1 bg-cream-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-cream-700 transition-colors disabled:opacity-50"
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
