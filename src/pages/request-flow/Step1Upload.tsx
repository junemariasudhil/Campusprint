import { useRef, useState, type DragEvent } from 'react'
import { PDFDocument } from 'pdf-lib'
import { FileText, Upload, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { StepProps } from './types'

export function Step1Upload({ draft, updateDraft, onNext }: StepProps & { onNext: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (file.type !== 'application/pdf') {
      setParseError('Only PDF files are supported.')
      return
    }

    setParsing(true)
    setParseError(null)

    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      const pageCount = pdf.getPageCount()
      updateDraft({ file, documentName: file.name, pageCount })
    } catch {
      setParseError("Couldn't read this PDF automatically — enter the page count manually below.")
      updateDraft({ file, documentName: file.name, pageCount: 1 })
    } finally {
      setParsing(false)
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function clearFile() {
    updateDraft({ file: null, documentName: '', pageCount: 0 })
    setParseError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Upload your document</h2>
        <p className="text-sm text-slate-400">Each document becomes its own print request.</p>
      </div>

      {!draft.file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-3 rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
            dragActive ? 'border-orange-400 bg-orange-50/60' : 'border-orange-300 bg-orange-50/30'
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
            <Upload className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-700">Drop your PDF here, or tap to browse</p>
            <p className="mt-1 text-xs text-slate-400">PDF files only</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>
      ) : (
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-800">{draft.documentName}</p>
            <p className="text-xs text-slate-400">
              {parsing ? 'Reading page count…' : `${draft.pageCount} page${draft.pageCount === 1 ? '' : 's'}`}
            </p>
          </div>
          <button
            onClick={clearFile}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </Card>
      )}

      {parseError && (
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
          {parseError}
          <div className="mt-2 flex items-center gap-2">
            <span>Page count:</span>
            <input
              type="number"
              min={1}
              value={draft.pageCount || 1}
              onChange={(e) => updateDraft({ pageCount: Math.max(1, Number(e.target.value)) })}
              className="w-20 rounded-xl border border-amber-200 bg-white px-2 py-1 text-sm outline-none"
            />
          </div>
        </div>
      )}

      <Button
        size="lg"
        disabled={!draft.file || parsing || draft.pageCount < 1}
        onClick={onNext}
        className="mt-2"
      >
        Continue
      </Button>
    </div>
  )
}
