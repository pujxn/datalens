import Groq from 'groq-sdk'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { schema, sampleRows, datasetName } = await req.json()

  const schemaText = schema
    .map((col: { name: string; type: string; nullCount: number; uniqueCount: number; sampleValues: string[] }) =>
      `- ${col.name} (${col.type}, ${col.nullCount} nulls, ${col.uniqueCount} unique, samples: ${col.sampleValues.slice(0, 3).join(', ')})`
    )
    .join('\n')

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    stream: true,
    messages: [
      {
        role: 'system',
        content:
          'You are a data analyst. Given a dataset schema and sample rows, generate exactly 5-6 specific, actionable insights. ' +
          'Reference actual column names and values. Each insight must start on its own line with "• ". ' +
          'Be concrete — mention specific numbers, distributions, or patterns. No markdown headers or bold text.',
      },
      {
        role: 'user',
        content: `Dataset: ${datasetName}\n\nSchema:\n${schemaText}\n\nSample data (up to 100 rows):\n${JSON.stringify(sampleRows.slice(0, 100))}`,
      },
    ],
  })

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(new TextEncoder().encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
