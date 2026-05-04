'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ParsedCSV } from '@/lib/csv-utils'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type Props = {
  data: ParsedCSV
}

export function ChatTab({ data }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([])
  }, [data.fileName])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const trimmed = input.trim()
    if (!trimmed || streaming) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setStreaming(true)

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    const assistantIndex = next.length
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          schema: data.columns,
          sampleRows: data.rows,
          datasetName: data.fileName,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error(`Error ${res.status}`)
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[assistantIndex] = { role: 'assistant', content: full }
          return updated
        })
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev]
          updated[assistantIndex] = {
            role: 'assistant',
            content: `Something went wrong: ${e.message}`,
          }
          return updated
        })
      }
    } finally {
      setStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-muted-foreground">
            <Bot className="h-8 w-8 opacity-20" />
            <p className="text-sm">Ask anything about your data</p>
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {[
                'What are the top 5 values in each column?',
                'Are there any missing values?',
                'What trends do you see?',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs border border-border/60 rounded-full px-3 py-1.5 hover:bg-muted transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center mt-0.5 ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              {msg.role === 'user'
                ? <User className="h-3.5 w-3.5" />
                : <Bot className="h-3.5 w-3.5" />
              }
            </div>

            <div className={`max-w-[78%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                : 'bg-muted text-foreground rounded-tl-sm'
            }`}>
              {msg.content ? (
                msg.role === 'user' ? (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      code: ({ children, className }) =>
                        className ? (
                          <code className="block bg-background/60 rounded px-2 py-1.5 text-xs font-mono overflow-x-auto my-1 whitespace-pre">{children}</code>
                        ) : (
                          <code className="bg-background/60 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
                        ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-2">
                          <table className="text-xs border-collapse w-full">{children}</table>
                        </div>
                      ),
                      th: ({ children }) => <th className="border border-border/40 px-2 py-1 bg-background/40 font-semibold text-left">{children}</th>,
                      td: ({ children }) => <td className="border border-border/40 px-2 py-1">{children}</td>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )
              ) : (
                <span className="inline-block h-4 w-1.5 bg-current opacity-60 animate-pulse rounded-sm" />
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/50 p-3 flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your data… (Enter to send)"
          rows={1}
          disabled={streaming}
          className="resize-none min-h-[40px] max-h-[120px] text-sm py-2.5"
        />
        <Button
          size="icon"
          onClick={send}
          disabled={!input.trim() || streaming}
          className="shrink-0 h-10 w-10"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
