"use client";

import ProductCard from "./ProductCard";

interface Product {
  id: string;
  category: string;
  description: string;
  openedDate: string;
  expiryDate: string;
}

export default function ProductList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg mb-2">No products yet</p>
        <p className="text-sm">
          Tap the + button to add your first makeup product
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
