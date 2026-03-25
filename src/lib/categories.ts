export interface Category {
  key: string;
  label: string;
  expiryMonths: number;
}

export const CATEGORIES: Category[] = [
  { key: "mascara", label: "Mascara", expiryMonths: 3 },
  { key: "foundation-liquid", label: "Foundation - Liquid", expiryMonths: 12 },
  { key: "foundation-stick", label: "Foundation - Stick", expiryMonths: 12 },
  { key: "foundation-powder", label: "Foundation - Powder", expiryMonths: 24 },
  { key: "concealer", label: "Concealer", expiryMonths: 12 },
  { key: "eyeliner-pencil", label: "Eyeliner - Pencil", expiryMonths: 12 },
  { key: "eyeliner-liquid", label: "Eyeliner - Liquid", expiryMonths: 6 },
  { key: "eyeshadow-powder", label: "Eyeshadow - Powder", expiryMonths: 24 },
  { key: "eyeshadow-cream", label: "Eyeshadow - Cream", expiryMonths: 6 },
  { key: "lipstick", label: "Lipstick", expiryMonths: 18 },
  { key: "lip-gloss", label: "Lip Gloss", expiryMonths: 12 },
  { key: "lip-liner", label: "Lip Liner", expiryMonths: 12 },
  { key: "blush-powder", label: "Blush - Powder", expiryMonths: 24 },
  { key: "blush-cream", label: "Blush - Cream", expiryMonths: 12 },
  { key: "bronzer-powder", label: "Bronzer - Powder", expiryMonths: 24 },
  { key: "bronzer-liquid", label: "Bronzer - Liquid", expiryMonths: 12 },
  { key: "highlighter-powder", label: "Highlighter - Powder", expiryMonths: 24 },
  { key: "highlighter-liquid", label: "Highlighter - Liquid", expiryMonths: 12 },
  { key: "brow-pencil", label: "Brow - Pencil", expiryMonths: 12 },
  { key: "brow-pomade", label: "Brow - Pomade", expiryMonths: 12 },
  { key: "setting-spray", label: "Setting Spray", expiryMonths: 6 },
  { key: "setting-powder-pressed", label: "Setting Powder - Pressed", expiryMonths: 24 },
  { key: "setting-powder-loose", label: "Setting Powder - Loose", expiryMonths: 24 },
  { key: "primer", label: "Primer", expiryMonths: 12 },
  { key: "makeup-remover", label: "Makeup Remover", expiryMonths: 6 },
];

// Map old keys to new keys for backwards compatibility
const OLD_KEY_MAP: Record<string, string> = {
  "liquid-foundation": "foundation-liquid",
  "stick-foundation": "foundation-stick",
  "powder-foundation": "foundation-powder",
  "pencil-eyeliner": "eyeliner-pencil",
  "liquid-eyeliner": "eyeliner-liquid",
  "powder-eyeshadow": "eyeshadow-powder",
  "cream-eyeshadow": "eyeshadow-cream",
  "powder-blush": "blush-powder",
  "cream-blush": "blush-cream",
  "brow-pencil": "brow-pencil",
  "brow-pomade": "brow-pomade",
  "setting-powder": "setting-powder-pressed",
};

export function getCategoryByKey(key: string): Category | undefined {
  const resolved = OLD_KEY_MAP[key] ?? key;
  return CATEGORIES.find((c) => c.key === resolved);
}

export function resolveKey(key: string): string {
  return OLD_KEY_MAP[key] ?? key;
}

export function calculateExpiryDate(openedDate: Date, expiryMonths: number): Date {
  const expiry = new Date(openedDate);
  expiry.setMonth(expiry.getMonth() + expiryMonths);
  return expiry;
}
