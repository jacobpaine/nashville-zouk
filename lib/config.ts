const DB_PLACEHOLDER_URL = 'postgresql://user:password@host/dbname?sslmode=require'

export function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL !== DB_PLACEHOLDER_URL
}

export function isStorageConfigured(): boolean {
  return (
    !!process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_ACCESS_KEY_ID !== 'your-access-key-id' &&
    !!process.env.AWS_SECRET_ACCESS_KEY &&
    !!process.env.AWS_REGION &&
    !!process.env.AWS_S3_BUCKET
  )
}

export function isEmailConfigured(): boolean {
  const key = process.env.RESEND_API_KEY
  return !!key && !key.startsWith('re_your_api_key')
}
