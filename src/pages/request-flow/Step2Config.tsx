import type { ReactNode } from 'react'
import { Minus, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Pill } from '@/components/ui/Pill'
import { PICKUP_SLOTS } from '@/types'
import type { StepProps } from './types'

export function Step2Config({
  draft,
  updateDraft,
  onNext,
  onBack,
}: StepProps & { onNext: () => void; onBack: () => void }) {
  const canContinue = Boolean(draft.preferredPickupStart)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Print configuration</h2>
        <p className="text-sm text-slate-400">Set finishing options and your preferred pickup time.</p>
      </div>

      <Field label="Copies">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => updateDraft({ copies: Math.max(1, draft.copies - 1) })}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-100 bg-white text-slate-500 hover:border-orange-300"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-lg font-bold text-slate-800">{draft.copies}</span>
          <button
            type="button"
            onClick={() => updateDraft({ copies: draft.copies + 1 })}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-100 bg-white text-slate-500 hover:border-orange-300"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </Field>

      <Field label="Colour mode">
        <div className="flex gap-2">
          <Pill active={draft.colourMode === 'BW'} onClick={() => updateDraft({ colourMode: 'BW' })}>
            Black &amp; White
          </Pill>
          <Pill active={draft.colourMode === 'COLOUR'} onClick={() => updateDraft({ colourMode: 'COLOUR' })}>
            Colour
          </Pill>
        </div>
      </Field>

      <Field label="Sides">
        <div className="flex gap-2">
          <Pill active={draft.sides === 'SINGLE'} onClick={() => updateDraft({ sides: 'SINGLE' })}>
            Single-sided
          </Pill>
          <Pill active={draft.sides === 'DOUBLE'} onClick={() => updateDraft({ sides: 'DOUBLE' })}>
            Double-sided
          </Pill>
        </div>
      </Field>

      <Field label="Stapling">
        <div className="flex gap-2">
          <Pill active={draft.stapling === 'NONE'} onClick={() => updateDraft({ stapling: 'NONE' })}>
            No stapling
          </Pill>
          <Pill active={draft.stapling === 'STAPLE'} onClick={() => updateDraft({ stapling: 'STAPLE' })}>
            Staple
          </Pill>
        </div>
      </Field>

      <Field label="Binding / finishing">
        <div className="flex flex-wrap gap-2">
          <Pill active={draft.binding === 'NONE'} onClick={() => updateDraft({ binding: 'NONE' })}>
            None
          </Pill>
          <Pill active={draft.binding === 'SOFT_SPIRAL'} onClick={() => updateDraft({ binding: 'SOFT_SPIRAL' })}>
            Soft Spiral Binding
          </Pill>
          <Pill active={draft.binding === 'HARD_SPIRAL'} onClick={() => updateDraft({ binding: 'HARD_SPIRAL' })}>
            Hard Spiral Binding
          </Pill>
        </div>
      </Field>

      <Field label="Comments (optional)">
        <textarea
          value={draft.comments}
          onChange={(e) => updateDraft({ comments: e.target.value })}
          placeholder="Anything the print shop should know?"
          rows={3}
          className="w-full rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none focus:border-orange-300"
        />
      </Field>

      <Field label="Preferred pickup time">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PICKUP_SLOTS.map((slot) => (
            <Pill
              key={slot.start}
              active={draft.preferredPickupStart === slot.start}
              onClick={() => updateDraft({ preferredPickupStart: slot.start, preferredPickupEnd: slot.end })}
            >
              {slot.label}
            </Pill>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          This is a requested pickup time and is not a guaranteed completion time.
        </p>
      </Field>

      <Field label="Priority printing">
        <button
          type="button"
          onClick={() => updateDraft({ priority: !draft.priority })}
          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 transition-colors ${
            draft.priority ? 'border-transparent bg-gradient-to-r from-orange-500 to-amber-400' : 'border-orange-100 bg-white'
          }`}
        >
          <span className={`flex items-center gap-2 text-sm font-semibold ${draft.priority ? 'text-white' : 'text-slate-600'}`}>
            <Sparkles className="h-4 w-4" />
            {draft.priority ? 'Priority (+10%)' : 'Normal'}
          </span>
          <span
            className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
              draft.priority ? 'bg-white/30' : 'bg-slate-200'
            }`}
          >
            <span
              className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                draft.priority ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </span>
        </button>
        <p className="mt-2 text-[11px] text-slate-400">
          Priority requests are processed ahead of normal requests where possible.
        </p>
      </Field>

      <div className="mt-2 flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" fullWidth disabled={!canContinue} onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">{label}</label>
      {children}
    </div>
  )
}
