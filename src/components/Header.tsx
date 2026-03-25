"use client";

import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
      <h1 className="text-lg font-bold text-cream-700">Makeup Expiry</h1>
      <div className="flex items-center gap-3">
        {session?.user?.image && (
          <img
            src={session.user.image}
            alt=""
            className="w-8 h-8 rounded-full"
          />
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
