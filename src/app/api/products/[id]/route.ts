import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCategoryByKey, calculateExpiryDate } from "@/lib/categories";
import {
  getValidAccessToken,
  deleteCalendarEvent,
  createExpiryReminder,
} from "@/lib/calendar";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { category, description, color, openedDate } = body;

    const updateData: Record<string, unknown> = {};

    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color || null;

    // If category or openedDate changed, recalculate expiry and recreate calendar event
    const newCategory = category ?? product.category;
    const newOpenedDate = openedDate ? new Date(openedDate) : product.openedDate;
    const categoryChanged = category && category !== product.category;
    const dateChanged = openedDate && new Date(openedDate).getTime() !== product.openedDate.getTime();

    if (categoryChanged || dateChanged) {
      const categoryData = getCategoryByKey(newCategory);
      if (!categoryData) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      const newExpiry = calculateExpiryDate(newOpenedDate, categoryData.expiryMonths);
      updateData.category = newCategory;
      updateData.openedDate = newOpenedDate;
      updateData.expiryDate = newExpiry;

      // Delete old calendar event and create new one
      try {
        const accessToken = await getValidAccessToken(session.user.id);
        if (product.calendarEventId) {
          await deleteCalendarEvent(accessToken, product.calendarEventId);
        }
        const newEventId = await createExpiryReminder(accessToken, {
          category: categoryData.label,
          description: description ?? product.description,
          openedDate: newOpenedDate,
          expiryDate: newExpiry,
        });
        updateData.calendarEventId = newEventId;
      } catch (error) {
        console.error("Failed to update calendar event:", error);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to update product:", message);
    return NextResponse.json(
      { error: `Failed to update product: ${message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete the Google Calendar event
  if (product.calendarEventId) {
    try {
      const accessToken = await getValidAccessToken(session.user.id);
      await deleteCalendarEvent(accessToken, product.calendarEventId);
    } catch (error) {
      console.error("Failed to delete calendar event:", error);
    }
  }

  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
