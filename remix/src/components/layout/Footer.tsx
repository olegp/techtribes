import { Link } from 'react-router-dom'

export function Footer() {
  const lastUpdated = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '/')

  return (
    <footer className="bg-secondary print:hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 text-center">
          <div className="w-full lg:w-auto">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
              <li className="flex items-center">
                Last updated on {lastUpdated}
              </li>
              <li className="flex items-center gap-2">
                <span>·</span>
                <a
                  href="https://github.com/olegp/techtribes"
                  className="hover:text-primary duration-150"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Code
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>·</span>
                <a href="/feed.xml" className="hover:text-primary duration-150">
                  Feed
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>·</span>
                <Link to="/guide" className="hover:text-primary duration-150">
                  Organizer guide
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full lg:w-auto lg:ml-auto">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
              <li className="flex items-center">
                Host a community on
                <a
                  href="https://www.meetabit.com/communities/new"
                  className="ml-1 hover:text-primary duration-150"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Meetabit
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>·</span>
                <span>Sponsored by</span>
                <a
                  href="https://www.toughbyte.com/about"
                  className="ml-1 hover:text-primary duration-150"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Toughbyte
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}