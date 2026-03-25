import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const products = await prisma.product.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const serialized = products.map((p) => ({
    id: p.id,
    category: p.category,
    description: p.description,
    color: p.color,
    openedDate: p.openedDate.toISOString(),
    expiryDate: p.expiryDate.toISOString(),
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        <DashboardClient products={serialized} />
      </main>
    </div>
  );
}
