"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="bg-cream-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-cream-700 transition-colors shadow-md"
    >
      Sign in with Google
    </button>
  );
}
