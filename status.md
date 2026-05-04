# DataLens — Build Status

## Stack
- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui (Radix UI primitives, custom components)
- Groq SDK (`llama-3.3-70b-versatile`) for AI
- Clerk v5 for auth
- Recharts for data visualization
- Papa Parse for client-side CSV parsing

## Steps

### ✅ Step 1 — Project setup
- Next.js 14 + Tailwind v3 + all dependencies
- UI primitives: Button, Card, Badge, Skeleton, Input, Textarea, ScrollArea, Separator
- Landing page: gradient hero, feature cards, stats bar, CTA, Clerk-aware nav

### ✅ Step 2 — Clerk auth + middleware
- ClerkProvider in root layout
- Middleware protecting `/dashboard`
- `/sign-in` and `/sign-up` Clerk pages
- Landing nav shows UserButton when signed in, sign-in/up when signed out

### ✅ Step 3 — CSV upload + Papa Parse + table preview
- Drag-and-drop upload zone with loading state and error handling
- Client-side parsing with Papa Parse (data never leaves browser)
- Column type detection: numeric / categorical / date
- Stats bar: row count, column count, null count
- Scrollable table preview (first 20 rows) with column type chips

### ✅ Step 4 — `/api/analyze` + Groq streaming insights
- POST route streams Groq response as plain text
- Clerk auth check on the route
- InsightsTab streams bullet points progressively
- Skeleton loader while waiting for first token
- Regenerate button

### ✅ Step 5 — Recharts auto-charts
- Smart chart selection based on column type + cardinality:
  - Categorical × Numeric → aggregated bar chart (sum by group)
  - Date × Numeric → line chart (monthly aggregation)
  - Numeric → histogram (bin count scales with √n)
  - High-cardinality categoricals skipped
- Chart picker buttons, description labels, legends
- Tooltip cursor fixed (no grey hover box)

### ✅ Step 6 — Chat tab + `/api/chat`
- POST route streams Groq response with full dataset context in system message
- ChatTab: scrollable message history, user/assistant bubbles, streaming cursor
- Suggested starter questions when conversation is empty
- Enter to send (Shift+Enter for newline), auto-scroll to latest message
- Conversation resets when a new CSV is uploaded

## Env vars
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=  ✅ set
CLERK_SECRET_KEY=                   ✅ set
GROQ_API_KEY=                       ✅ set
```
