import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const bcrypt = await import('bcryptjs')
    const { db } = await import('@/lib/db')
    const { adminUsers } = await import('@/lib/schema')

    const passwordHash = await bcrypt.hash('admin', 10)

    await db
      .insert(adminUsers)
      .values({ email: 'admin@nashvillezouk.com', passwordHash })
      .onConflictDoUpdate({ target: adminUsers.email, set: { passwordHash } })

    return NextResponse.json({ ok: true, message: 'Admin user set. Email: admin@nashvillezouk.com, Password: admin' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
