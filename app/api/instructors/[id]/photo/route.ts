import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { isDbConfigured, isStorageConfigured } from '@/lib/config'

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']

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

  const ext = (file.name.split('.').pop() ?? '').toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Allowed: jpg, jpeg, png, webp, gif.' },
      { status: 400 }
    )
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 413 })
  }

  const { uploadFile, deleteFile } = await import('@/lib/storage')
  const key = `instructors/${id}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const photoUrl = await uploadFile(key, buffer, file.type)

  if (!isDbConfigured()) {
    return NextResponse.json({ photoUrl, photoKey: key })
  }

  try {
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
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}
