'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface UploadedFlyer {
  id: string
  title: string
  imageUrl: string
}

interface FlyerUploaderProps {
  onSuccess: (flyer: UploadedFlyer) => void
}

export function FlyerUploader({ onSuccess }: FlyerUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError(null)
    if (!title) {
      setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title.trim()) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title.trim())

    try {
      const res = await fetch('/api/flyers', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed.')
      onSuccess(data)
      setFile(null)
      setPreview(null)
      setTitle('')
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  function reset() {
    setFile(null)
    setPreview(null)
    setTitle('')
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop zone */}
      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragging ? 'border-pink-400 bg-pink-50' : 'border-gray-200 hover:border-gray-400'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload flyer image"
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500">
            <span className="text-pink-600 font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="sr-only"
          />
        </div>
      ) : (
        <div className="relative">
          <div className="relative w-48 rounded-xl overflow-hidden shadow-lg">
            <Image src={preview} alt="Flyer preview" width={400} height={533} className="w-full h-auto" />
          </div>
          <button
            type="button"
            onClick={reset}
            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors min-h-0 min-w-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Title */}
      {file && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="flyer-title">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="flyer-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Nashville Zouk Social — June 2026"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-base min-h-0"
          />
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}

      {file && (
        <button
          type="submit"
          disabled={uploading || !title.trim()}
          className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white rounded-xl font-medium transition-colors shadow-sm min-h-0 min-w-0"
        >
          {uploading ? 'Uploading…' : 'Upload Flyer'}
        </button>
      )}
    </form>
  )
}
