import { Code2, MapPin, Rss, Tag } from "lucide-react";
import { Link } from "react-router";

import { ThemeToggle } from "~/components/layout/ThemeToggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { REPO_URL } from "~/lib/site";

export function Header() {
  return (
    <header>
      <nav className="fixed top-0 inset-x-0 z-20 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4">
          <div className="relative flex items-center justify-between py-4">
            <Link to="/" aria-label="home" className="flex items-center gap-2">
              <img src="/assets/icons/tent.svg" width="24" height="24" className="size-6" alt="" />
              <span className="text-xl font-bold">Techtribes</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/tags"
                className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
              >
                <Tag className="size-5" aria-hidden="true" />
                <span>Topics</span>
              </Link>
              <Link
                to="/locations"
                className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
              >
                <MapPin className="size-5" aria-hidden="true" />
                <span>Locations</span>
              </Link>
              <a
                href={REPO_URL}
                className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
              >
                <Code2 className="size-5" aria-hidden="true" />
                <span>Code</span>
              </a>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Plain <a>: /feed.xml is a static file, not a client route. */}
                  <a
                    href="/feed.xml"
                    className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
                  >
                    <Rss className="size-5" aria-hidden="true" />
                    <span>Feed</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent side="left">Use feedrabbit.com for email alerts</TooltipContent>
              </Tooltip>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
