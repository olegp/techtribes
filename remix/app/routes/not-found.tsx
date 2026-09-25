import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { notFoundMeta } from "~/lib/meta";

export const meta = notFoundMeta;

/**
 * Catch-all route. It is pre-rendered at /404 (copied to 404.html for GitHub
 * Pages), so it must render normally with a 200 status rather than throwing.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-12 text-center">
      <header className="flex max-w-sm flex-col items-center gap-3">
        <div className="text-6xl font-bold text-muted-foreground">404</div>
        <h1 className="text-2xl font-bold">Not found</h1>
        <p className="text-muted-foreground text-sm/relaxed">
          The page you were looking for doesn&apos;t exist.
        </p>
      </header>
      <section className="flex gap-2">
        <Button asChild>
          <Link to="/">
            <ArrowLeft aria-hidden="true" />
            Go home
          </Link>
        </Button>
      </section>
    </div>
  );
}
