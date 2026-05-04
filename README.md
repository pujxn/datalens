# DataLens

Upload a CSV and instantly get AI-generated insights, auto-selected charts, and a chat interface to ask questions about your data — all in the browser.

**Live:** https://datalens-wine.vercel.app

## Features

- **CSV upload** — drag-and-drop parsing via Papa Parse; data never leaves the browser
- **Column analysis** — automatic type detection (numeric / categorical / date), null counts, unique counts
- **AI insights** — streams 5–6 specific, data-grounded observations via Groq (Llama 3.3 70B)
- **Auto charts** — picks the right chart type based on column types and cardinality (bar, line, histogram)
- **Chat** — conversational Q&A about your dataset with full markdown rendering in responses

## Stack

- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui
- Groq SDK (`llama-3.3-70b-versatile`)
- Clerk v5 for auth
- Recharts
- Papa Parse
- react-markdown + remark-gfm

## Running locally

```bash
npm install
npm run dev
```

Create a `.env.local` with:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
GROQ_API_KEY=...
```

You'll need a [Clerk](https://clerk.com) app and a [Groq](https://console.groq.com) API key.
