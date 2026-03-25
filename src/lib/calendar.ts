import { google } from "googleapis";
import { prisma } from "./db";

export async function getValidAccessToken(userId: string): Promise<string> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.access_token) {
    throw new Error("No Google account linked");
  }

  // Check if token is expired (with 5 min buffer)
  const isExpired =
    account.expires_at && account.expires_at * 1000 < Date.now() - 300_000;

  if (!isExpired) {
    return account.access_token;
  }

  // Refresh the token
  if (!account.refresh_token) {
    throw new Error("No refresh token available. Please sign out and sign in again.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID!,
      client_secret: process.env.AUTH_GOOGLE_SECRET!,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  });

  const tokens = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${tokens.error_description || tokens.error}`);
  }

  // Update stored tokens
  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: tokens.access_token,
      expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
    },
  });

  return tokens.access_token;
}

interface ProductForCalendar {
  category: string;
  description: string;
  openedDate: Date;
  expiryDate: Date;
}

export async function createExpiryReminder(
  accessToken: string,
  product: ProductForCalendar
): Promise<string> {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Schedule the event 2 weeks before expiry
  const reminderDate = new Date(product.expiryDate);
  reminderDate.setDate(reminderDate.getDate() - 14);

  const openedStr = product.openedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const expiryStr = product.expiryDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Format date as YYYY-MM-DD for all-day event
  const dateStr = reminderDate.toISOString().split("T")[0];

  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: `${product.category} expiring soon — ${product.description}`,
      description: `Your ${product.category} (${product.description}) was opened on ${openedStr} and expires on ${expiryStr}. Time to replace it!`,
      start: { date: dateStr },
      end: { date: dateStr },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 0 },
          { method: "email", minutes: 0 },
        ],
      },
    },
  });

  return event.data.id!;
}

export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  try {
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });
  } catch (error: unknown) {
    // Event may have been manually deleted — that's fine
    const status = (error as { code?: number }).code;
    if (status !== 404 && status !== 410) {
      throw error;
    }
  }
}
