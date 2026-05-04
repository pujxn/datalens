import Groq from 'groq-sdk'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { messages, schema, sampleRows, datasetName } = await req.json()

  const schemaText = schema
    .map((col: { name: string; type: string; nullCount: number; uniqueCount: number; sampleValues: string[] }) =>
      `- ${col.name} (${col.type}, ${col.nullCount} nulls, ${col.uniqueCount} unique, samples: ${col.sampleValues.slice(0, 3).join(', ')})`
    )
    .join('\n')

  const systemMessage = {
    role: 'system' as const,
    content:
      `You are a data analyst assistant. The user has uploaded a CSV dataset called "${datasetName}". ` +
      `Answer questions about this dataset concisely and accurately. Reference specific column names and values. ` +
      `If asked to calculate or aggregate, work through it step-by-step. No markdown headers.\n\n` +
      `Schema:\n${schemaText}\n\n` +
      `Sample data (up to 100 rows):\n${JSON.stringify(sampleRows.slice(0, 100))}`,
  }

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    stream: true,
    messages: [systemMessage, ...messages],
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
