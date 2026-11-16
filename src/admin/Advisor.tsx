import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PageProps } from './AdminApp'
import { ai } from './client'
import { btn, input } from './ui'

const STARTERS = [
  'Why are people sending quote requests? What do buyers do before they ask?',
  'Which country and product should we focus our next email campaign on?',
  'Where are we losing buyers between visiting and asking for a price?',
  'Which campaign worked best and why?',
  'Which supplier categories do we need more of, based on buyer demand?',
  'What should the team do this week to win more orders?',
]

type Msg = { role: 'you' | 'advisor'; text: string }

export function Advisor(_: PageProps) {
  const [msgs, setMsgs] = useState<Msg[]>(() => { try { return JSON.parse(sessionStorage.getItem('bde-advisor') ?? '[]') } catch { return [] } })
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { try { sessionStorage.setItem('bde-advisor', JSON.stringify(msgs.slice(-20))) } catch { /* ignore */ } end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function ask(question: string) {
    if (!question.trim() || busy) return
    const next = [...msgs, { role: 'you' as const, text: question.trim() }]
    setMsgs(next); setQ(''); setBusy(true)
    try {
      const r = await ai<{ answer: string }>('ask', { question: question.trim(), history: msgs.slice(-6) })
      setMsgs([...next, { role: 'advisor', text: r.answer }])
    } catch (e) {
      setMsgs([...next, { role: 'advisor', text: (e as Error).message }])
    } finally { setBusy(false) }
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <div className="rounded-2xl border border-brand/25 bg-gradient-to-br from-brand-soft via-card to-card p-6">
        <h2 className="m-0 flex items-center gap-2 text-xl"><Sparkles className="size-5 text-brand" />Ask your business anything</h2>
        <p className="mt-1.5 mb-0 text-[14px] text-muted-foreground">The advisor reads the last 60 days of website visits, quote requests, email results, contacts and suppliers, then answers in plain language with the numbers behind it.</p>
      </div>
      {!msgs.length && (
        <div className="grid gap-2 sm:grid-cols-2">
          {STARTERS.map((s) => <button key={s} type="button" onClick={() => ask(s)} className="rounded-xl border border-border bg-card p-4 text-left text-[14px] hover:border-brand">{s}</button>)}
        </div>
      )}
      <div className="grid gap-3">
        {msgs.map((m, i) => (
          <div key={i} className={cn('max-w-[90%] rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed whitespace-pre-wrap', m.role === 'you' ? 'ml-auto bg-brand text-white' : 'border border-border bg-card')}>{m.text}</div>
        ))}
        {busy && <div className="w-fit animate-pulse rounded-2xl border border-border bg-card px-4 py-3 text-[14px] text-muted-foreground">Looking at your data…</div>}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(q) }} className="sticky bottom-4 flex gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg">
        <input className={cn(input, 'flex-1 border-0 shadow-none')} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about buyers, products, countries, campaigns, suppliers…" />
        <button disabled={busy || !q.trim()} className={cn(btn, 'btn-primary disabled:opacity-50')} aria-label="Ask"><ArrowUp className="size-4" /></button>
        {!!msgs.length && <button type="button" onClick={() => setMsgs([])} className={cn(btn, 'btn-outline')}>New</button>}
      </form>
    </div>
  )
}
