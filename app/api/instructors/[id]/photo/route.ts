import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

const PLACEHOLDER_URL = 'postgresql://user:password@host/dbname?sslmode=require'
function isDbConfigured() {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL !== PLACEHOLDER_URL
}

function isStorageConfigured() {
  return !!process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_ACCESS_KEY_ID !== 'your-access-key-id'
}

interface Params { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: 'S3 storage is not configured. Add AWS credentials to .env.local.' },
      { status: 503 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('photo') as File | null

  if (!file) return NextResponse.json({ error: 'Photo is required.' }, { status: 400 })
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 })
  }

  const { uploadFile, deleteFile } = await import('@/lib/storage')
  const ext = file.name.split('.').pop() ?? 'jpg'
  const key = `instructors/${id}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const photoUrl = await uploadFile(key, buffer, file.type)

  if (!isDbConfigured()) {
    return NextResponse.json({ photoUrl, photoKey: key })
  }

  const { db } = await import('@/lib/db')
  const { instructors } = await import('@/lib/schema')
  const { eq } = await import('drizzle-orm')

  const rows = await db.select().from(instructors).where(eq(instructors.id, id)).limit(1)
  const instructor = rows[0]
  if (!instructor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (instructor.photoKey) {
    await deleteFile(instructor.photoKey).catch(() => null)
  }

  await db
    .update(instructors)
    .set({ photoUrl, photoKey: key, updatedAt: new Date() })
    .where(eq(instructors.id, id))

  return NextResponse.json({ photoUrl, photoKey: key })
}
