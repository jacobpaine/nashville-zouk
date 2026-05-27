import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { isDbConfigured, isStorageConfigured } from '@/lib/config'
import { MOCK_FLYERS } from '@/lib/mock'

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']

export async function GET() {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json(MOCK_FLYERS)
  }

  try {
    const { db } = await import('@/lib/db')
    const { flyers } = await import('@/lib/schema')
    const { desc } = await import('drizzle-orm')
    const rows = await db.select().from(flyers).orderBy(desc(flyers.createdAt))
    return NextResponse.json(rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const title = formData.get('title') as string

  if (!file || !title) {
    return NextResponse.json({ error: 'File and title are required.' }, { status: 400 })
  }

  const ext = (file.name.split('.').pop() ?? '').toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Allowed: jpg, jpeg, png, webp, gif.' },
      { status: 400 }
    )
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 413 })
  }

  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: 'S3 storage is not configured. Add AWS credentials to .env.local to enable uploads.' },
      { status: 503 }
    )
  }

  const { uploadFile } = await import('@/lib/storage')
  const key = `flyers/${Date.now()}-${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const imageUrl = await uploadFile(key, buffer, file.type)

  if (!isDbConfigured()) {
    return NextResponse.json({ id: crypto.randomUUID(), title, imageUrl, imageKey: key, isCurrent: false })
  }

  try {
    const { db } = await import('@/lib/db')
    const { flyers } = await import('@/lib/schema')
    const rows = await db.insert(flyers).values({ title, imageUrl, imageKey: key }).returning()
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}
