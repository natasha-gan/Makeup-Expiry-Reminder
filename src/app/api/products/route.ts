import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCategoryByKey, calculateExpiryDate } from "@/lib/categories";
import { getValidAccessToken, createExpiryReminder } from "@/lib/calendar";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { userId: session.user.id },
    orderBy: { expiryDate: "asc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { category, description, openedDate, color } = body;

    if (!category || !description || !openedDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const categoryData = getCategoryByKey(category);
    if (!categoryData) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const opened = new Date(openedDate);
    const expiryDate = calculateExpiryDate(opened, categoryData.expiryMonths);

    // Save product first so we don't create orphaned calendar events
    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        category,
        description,
        color: color?.trim() || null,
        openedDate: opened,
        expiryDate,
      },
    });

    // Then create Google Calendar event and link it
    try {
      const accessToken = await getValidAccessToken(session.user.id);
      const calendarEventId = await createExpiryReminder(accessToken, {
        category: categoryData.label,
        description,
        openedDate: opened,
        expiryDate,
      });
      await prisma.product.update({
        where: { id: product.id },
        data: { calendarEventId },
      });
      product.calendarEventId = calendarEventId;
    } catch (error) {
      console.error("Failed to create calendar event:", error);
      // Product is saved, calendar just didn't work
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to create product:", message, error);
    return NextResponse.json(
      { error: `Failed to create product: ${message}` },
      { status: 500 }
    );
  }
}
