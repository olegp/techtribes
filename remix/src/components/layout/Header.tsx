import { Link } from 'react-router-dom'
import { Code2, Rss } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header>
      <nav className="fixed top-0 left-0 right-0 z-20 w-full bg-white border-b transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="relative flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 21 14 3l10.5 18Z" />
                <path d="M14 3v18" />
                <path d="M3.5 21h17" />
              </svg>
              <span className="text-xl font-bold">Techtribes</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <a
                  href="https://github.com/olegp/techtribes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Code2 className="h-4 w-4" />
                  <span>Code</span>
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                title="Use feedrabbit.com for email alerts"
              >
                <a
                  href="/feed.xml"
                  className="flex items-center gap-2"
                >
                  <Rss className="h-4 w-4" />
                  <span>Feed</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}