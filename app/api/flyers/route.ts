import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { MOCK_FLYER } from '@/lib/mock'

const PLACEHOLDER_URL = 'postgresql://user:password@host/dbname?sslmode=require'
function isDbConfigured() {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL !== PLACEHOLDER_URL
}

function isStorageConfigured() {
  return !!process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_ACCESS_KEY_ID !== 'your-access-key-id'
}

export async function GET() {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json([MOCK_FLYER])
  }

  const { db } = await import('@/lib/db')
  const { flyers } = await import('@/lib/schema')
  const { desc } = await import('drizzle-orm')
  const rows = await db.select().from(flyers).orderBy(desc(flyers.createdAt))
  return NextResponse.json(rows)
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

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 })
  }

  if (!isStorageConfigured()) {
    return NextResponse.json({
      error: 'S3 storage is not configured. Add AWS credentials to .env.local to enable uploads.',
    }, { status: 503 })
  }

  const { uploadFile } = await import('@/lib/storage')
  const ext = file.name.split('.').pop() ?? 'jpg'
  const key = `flyers/${Date.now()}-${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const imageUrl = await uploadFile(key, buffer, file.type)

  if (!isDbConfigured()) {
    return NextResponse.json({ id: crypto.randomUUID(), title, imageUrl, imageKey: key, isCurrent: false })
  }

  const { db } = await import('@/lib/db')
  const { flyers } = await import('@/lib/schema')
  const rows = await db.insert(flyers).values({ title, imageUrl, imageKey: key }).returning()
  return NextResponse.json(rows[0], { status: 201 })
}
