import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import { getAboutContent } from '@/lib/queries'
import { EmailSignupForm } from '@/components/EmailSignupForm'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Nashville Zouk and Brazilian Zouk dance in Nashville, TN.',
}

export default async function AboutPage() {
  const content = await getAboutContent()

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">About</h1>

      <div className="prose prose-gray max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      <div className="mt-16 pt-10 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Stay in the loop</h2>
        <p className="text-gray-500 mb-6">
          Get notified about upcoming socials, workshops, and special events.
        </p>
        <EmailSignupForm />
      </div>
    </div>
  )
}
