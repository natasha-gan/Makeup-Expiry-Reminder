import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignInButton from "@/components/SignInButton";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-cream-700 mb-3">
          Makeup Expiry Reminder
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Track when you open your makeup and get a Google Calendar reminder
          before it expires.
        </p>
        <SignInButton />
      </div>
    </main>
  );
}
