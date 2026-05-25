import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto bg-gray-950 text-gray-400">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-start gap-8 justify-between">
          <div>
            <p className="text-white font-bold text-lg">Nashville Zouk</p>
            <p className="text-sm mt-1 text-gray-500">Brazilian Zouk dance in Nashville, TN</p>
          </div>

          <nav className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm" aria-label="Footer navigation">
            <div className="flex flex-col gap-2">
              <p className="text-white font-medium text-xs uppercase tracking-wider">Community</p>
              <Link href="/events" className="hover:text-white transition-colors min-h-0 min-w-0">Events</Link>
              <Link href="/instructors" className="hover:text-white transition-colors min-h-0 min-w-0">Instructors</Link>
              <Link href="/about" className="hover:text-white transition-colors min-h-0 min-w-0">About</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-white font-medium text-xs uppercase tracking-wider">Archive</p>
              <Link href="/flyers" className="hover:text-white transition-colors min-h-0 min-w-0">Flyer Archive</Link>
            </div>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Nashville Zouk. All rights reserved.</p>
          <Link href="/admin/login" className="hover:text-gray-400 transition-colors min-h-0 min-w-0">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
