import { useState } from 'react'
import { cn } from '@/lib/utils'
import { fmtTime, sb } from './client'
import { btn, input, useAsync } from './ui'

/** Internal notes and history for a lead, supplier, contact or campaign. */
export function Notes({ entity, id, me }: { entity: 'lead' | 'supplier' | 'contact' | 'campaign'; id: number; me: string }) {
  const { data, reload } = useAsync(async () => (await sb().from('bde_activity').select('*').eq('entity', entity).eq('entity_id', id).order('created_at', { ascending: false }).limit(100)).data ?? [], [entity, id])
  const [text, setText] = useState('')
  async function add() {
    if (!text.trim()) return
    await sb().from('bde_activity').insert({ entity, entity_id: id, actor: me, kind: 'note', body: text.trim() })
    setText(''); reload()
  }
  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <textarea className={cn(input, 'min-h-[44px] flex-1')} rows={2} placeholder="Add a note (call summary, price agreed, next step…)" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="button" onClick={add} className={cn(btn, 'btn-primary self-start')}>Add</button>
      </div>
      <ul className="m-0 grid list-none gap-2 p-0">
        {(data ?? []).map((a: any) => (
          <li key={a.id} className={cn('rounded-lg px-3 py-2 text-[13.5px]', a.kind === 'note' ? 'bg-[#fef9c3]' : 'bg-muted')}>
            <div className="whitespace-pre-wrap">{a.body}</div>
            <div className="mt-1 text-[11.5px] text-muted-foreground">{a.actor ?? 'system'} · {fmtTime(a.created_at)}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export async function logActivity(entity: 'lead' | 'supplier' | 'contact' | 'campaign', id: number, me: string, body: string, kind = 'change') {
  await sb().from('bde_activity').insert({ entity, entity_id: id, actor: me, kind, body })
}
