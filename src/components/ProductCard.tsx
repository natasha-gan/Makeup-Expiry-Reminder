"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCategoryByKey } from "@/lib/categories";
import ExpiryBadge from "./ExpiryBadge";

interface Product {
  id: string;
  category: string;
  description: string;
  openedDate: string;
  expiryDate: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const cat = getCategoryByKey(product.category);

  async function handleDelete() {
    if (!confirm("Remove this product? The calendar reminder will also be deleted.")) {
      return;
    }
    setDeleting(true);
    try {
      await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      setDeleting(false);
    }
  }

  const openedStr = new Date(product.openedDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const expiryStr = new Date(product.expiryDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">
            {cat?.label ?? product.category}
          </p>
          <p className="text-sm text-gray-500">{product.description}</p>
        </div>
        <ExpiryBadge expiryDate={product.expiryDate} />
      </div>
      <div className="text-xs text-gray-400 flex gap-4">
        <span>Opened: {openedStr}</span>
        <span>Expires: {expiryStr}</span>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="self-end text-xs text-red-400 hover:text-red-600 disabled:opacity-50 mt-1"
      >
        {deleting ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}
