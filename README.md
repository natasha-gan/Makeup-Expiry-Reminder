# Makeup Expiry Reminder

Track when you open your makeup products and get a Google Calendar reminder before they expire.

![Screenshot](screenshot.png)

## Problem Statement

Expired makeup is more than a nuisance; it's a health risk. Bacteria builds up in opened cosmetics over time, leading to skin irritation, breakouts, and eye infections. Most products have a small PAO (Period After Opening) symbol on the packaging indicating how long they're safe to use, but it's easy to ignore and it's impossible to remember across a plethora of products.

The result: people either use products past their safe date without realizing it, or throw out products prematurely because they can't remember when they opened them.

## Target Users

Everyday makeup users who have a growing collection and want to:
- Avoid using expired products that could harm their skin
- Reduce waste by knowing exactly when each product expires
- Make smarter repurchase decisions based on actual usage patterns

## Features

- **Track opened products**: Log a makeup product when you open it and the app calculates the expiry date automatically
- **Google Calendar reminders**: A calendar event is created 2 weeks before expiry so you know when to replace it
- **Search and filter**: Find products by name, colour, or filter by product type
- **Edit and remove**: Click any product to update its details, or remove it, which also deletes the calendar reminder
- **25 product categories**: Supports foundation, concealer, mascara, eyeliner, eyeshadow, lipstick, lip gloss, blush, bronzer, highlighter, brow products, setting spray, setting powder, primer, makeup remover, and more — each with their standard Period After Opening (PAO) expiry

## Key Product Decisions

| Decision | Rationale |
|---|---|
| Google Calendar for reminders | Meets users where they already are. No need to check another app. One integration handles both authentication and reminders. |
| Preset PAO periods per category | Users don't need to research expiry times. The app knows mascara is 3 months and powder is 24 months. |
| Inline add form on dashboard | Minimizes friction on mobile. Adding a product is a single scroll away, not a separate page or navigation step. |
| Google OAuth (no custom auth) | A single sign-in flow gives us both user identity and calendar access without managing any passwords. |
| Web app over native mobile | No app store approval, no downloads, accessible from any device. Lower barrier to entry for a utility tool. |

## Product Vision & Roadmap

### Near-term
- **Product ratings**: Rate products (1-5 stars) to build a personal quality record over time
- **Removal reasons**: When deleting a product, users specify why (expired, threw out early, finished, didn't like it) to inform future repurchase decisions
- **Repurchase insights**: Surface patterns like "You've repurchased this mascara 3 times" or "You threw out your last 2 cream blushes before expiry — consider switching to powder"
- **Push notifications**: Browser-based push notifications as an alternative to Google Calendar

### Medium-term
- **Barcode / PAO symbol scanning**: Use the phone camera to scan packaging and auto-detect the product type and expiry period
- **Analytics dashboard**: Spending trends, most-used categories, waste reduction stats, average product lifespan vs. PAO
- **Repurchase links**: Direct links to repurchase products from retailers when they're nearing expiry

### Long-term
- **Community features**: Share routines, product recommendations, and reviews with other users
- **Multi-platform native apps**: iOS and Android apps with offline support and camera integration
- **Brand partnerships**: Anonymized, aggregated usage data could help cosmetics brands understand real-world product lifespans

## Success Metrics

| Metric | What it measures |
|---|---|
| Products tracked per user | Engagement depth: are users logging their full collection? |
| Weekly active users | Retention: do users come back to log new products? |
| Reminder engagement rate | Value delivery: are calendar reminders being seen and acted on? |
| Expired products caught | Core outcome: how many products were flagged before unsafe use? |
| Repurchase rate by rating | Feature validation: do ratings correlate with rebuy behaviour? |


## Setup

1. Clone the repo
2. Install dependencies: `pnpm install`
3. Set up a Google Cloud project with the Google Calendar API enabled and OAuth 2.0 credentials
4. Create a `.env.local` file:
   ```
   DATABASE_URL="file:./dev.db"
   AUTH_GOOGLE_ID="your-google-client-id"
   AUTH_GOOGLE_SECRET="your-google-client-secret"
   AUTH_SECRET="generate-with-openssl-rand-base64-32"
   ```
5. Push the database schema: `DATABASE_URL="file:./dev.db" npx prisma db push`
6. Run the dev server: `pnpm dev`
7. Open http://localhost:3000

## Tech Stack

- Next.js 15 + TypeScript
- Prisma + SQLite
- Auth.js (NextAuth v5) with Google OAuth
- Google Calendar API
- Tailwind CSS
