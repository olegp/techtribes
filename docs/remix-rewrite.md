# Techtribes Remix Migration Plan

## Executive Summary

This document outlines the migration plan from Jekyll static site generator to Remix (React Router) with static site generation, incorporating shadcn/ui components and Tailark design system. The migration will modernize the tech stack while maintaining all existing functionality and improving developer experience.

## Current Architecture

### Jekyll Stack
- **Static Site Generator**: Jekyll with Liquid templating
- **Styling**: Basecoat CSS + Tailwind CSS
- **Data Pipeline**: TypeScript scrapers → YAML → Jekyll build
- **Hosting**: Static files served from `site/_site/`

### Data Flow
1. Communities defined in `data/communities.yml`
2. TypeScript scrapers fetch event data
3. Output saved to `site/_data/output.yml`
4. Jekyll builds static HTML using Liquid templates

## Target Architecture

### Remix Stack
- **Framework**: Remix v2 with Vite (React Router v7)
- **Rendering**: Static Site Generation (SSG) via `vite-plugin-remix`
- **Components**: shadcn/ui component library
- **Styling**: Tailark design system + Tailwind CSS v4
- **Data Pipeline**: TypeScript scrapers → JSON → Remix loaders
- **Deployment**: Static build via Remix SSG adapter

## Migration Strategy

### Phase 1: Project Setup (Week 1)

#### 1.1 Initialize Remix Project
```bash
npx create-remix@latest remix --template remix-run/remix/templates/vite
cd remix
npm install
```

#### 1.2 Configure Static Site Generation
```typescript
// vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    remix({
      ssr: true,
      serverBuildFile: "server.js",
      future: {
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true
      }
    })
  ],
  build: {
    target: "esnext"
  }
})
```

#### 1.3 Install shadcn/ui
```bash
npx shadcn@latest init
npx shadcn@latest add card button badge
```

#### 1.4 Install Tailark
```bash
npm install tailark
# Configure tailark.config.js for custom design tokens
```

### Phase 2: Component Migration (Week 2)

#### 2.1 Project Structure
```
remix/
├── app/
│   ├── routes/
│   │   ├── _index.tsx          # Home page
│   │   ├── guide.tsx            # Guide page
│   │   └── api.scrape.ts        # API route for scraping
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── cards/
│   │   │   └── CommunityCard.tsx
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── scrapers/            # Existing scrapers
│   │   ├── data.server.ts       # Data loading utilities
│   │   └── utils.ts
│   ├── styles/
│   │   └── globals.css           # Tailwind imports
│   └── root.tsx                  # Root layout
├── public/
│   ├── assets/
│   │   ├── logos/
│   │   ├── icons/
│   │   └── favicons/
│   └── social/
├── data/
│   └── communities.yml
└── build/                        # Static output
```

#### 2.2 Component Mapping

| Jekyll Component | Remix Component | Notes |
|-----------------|-----------------|-------|
| `_layouts/default.html` | `app/root.tsx` | Root layout with HTML structure |
| `_includes/header.html` | `app/components/layout/Header.tsx` | Convert to React component |
| `_includes/footer.html` | `app/components/layout/Footer.tsx` | Convert to React component |
| `_includes/card.html` | `app/components/cards/CommunityCard.tsx` | Use shadcn/ui Card |
| `index.html` | `app/routes/_index.tsx` | Homepage with event listings |
| `guide.md` | `app/routes/guide.tsx` | MDX or markdown-to-JSX |

#### 2.3 Sample Component: CommunityCard.tsx
```typescript
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"

interface CommunityCardProps {
  community: {
    name: string
    logo: string
    location: string
    eventLocation?: string
    date: string
    event: string
    events: string
    site?: string
    members?: number
    tags: string[]
  }
}

export function CommunityCard({ community }: CommunityCardProps) {
  return (
    <Card className="group transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <a
            href={community.site || community.events}
            className="block shrink-0 transition-opacity hover:opacity-80"
          >
            <img
              src={community.logo.startsWith('http')
                ? community.logo
                : `/assets/logos/${community.logo}`}
              alt={`${community.name} logo`}
              className="size-16 rounded-xl object-cover ring-1 ring-foreground/10"
              loading="lazy"
            />
          </a>

          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold">
                <a
                  href={community.site || community.events}
                  className="transition-colors hover:text-primary"
                >
                  {community.name}
                </a>
              </h3>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 opacity-70" />
                <a
                  href={community.event}
                  className="text-primary hover:underline"
                >
                  {community.date}
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 opacity-70" />
                  {community.eventLocation || community.location}
                </div>

                {community.members && (
                  <>
                    <span className="opacity-50">·</span>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 opacity-70" />
                      {community.members}
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {community.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Phase 3: Data Pipeline Migration (Week 3)

#### 3.1 Data Loading Strategy
```typescript
// app/lib/data.server.ts
import { promises as fs } from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export async function getCommunities() {
  const dataPath = path.join(process.cwd(), 'data/communities.yml')
  const fileContent = await fs.readFile(dataPath, 'utf8')
  return yaml.load(fileContent) as Community[]
}

export async function getEvents() {
  const eventsPath = path.join(process.cwd(), 'data/output.json')
  const fileContent = await fs.readFile(eventsPath, 'utf8')
  return JSON.parse(fileContent) as EventData
}
```

#### 3.2 Route Loader Pattern
```typescript
// app/routes/_index.tsx
import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { getEvents } from "~/lib/data.server"
import { CommunityCard } from "~/components/cards/CommunityCard"

export async function loader({ request }: LoaderFunctionArgs) {
  const events = await getEvents()
  const today = new Date()

  const upcomingEvents = events.events.filter(event => {
    const [day, month, year] = event.date.split('/')
    const eventDate = new Date(+year, +month - 1, +day)
    return eventDate >= today
  })

  const pastEvents = events.events.filter(event => {
    const [day, month, year] = event.date.split('/')
    const eventDate = new Date(+year, +month - 1, +day)
    return eventDate < today
  })

  return json({ upcomingEvents, pastEvents })
}

export default function Index() {
  const { upcomingEvents, pastEvents } = useLoaderData<typeof loader>()

  return (
    <div>
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold">Upcoming Events</h2>
        <div className="space-y-4">
          {upcomingEvents.map(event => (
            <CommunityCard key={event.name + event.date} community={event} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold">Past Events</h2>
        <div className="space-y-4">
          {pastEvents.map(event => (
            <CommunityCard key={event.name + event.date} community={event} />
          ))}
        </div>
      </section>
    </div>
  )
}
```

#### 3.3 Scraper Integration
- Keep existing TypeScript scrapers
- Modify output to JSON instead of YAML
- Create npm script to run scrapers before build
- Option: Create API route for on-demand scraping

### Phase 4: Styling Migration (Week 3-4)

#### 4.1 Tailark Configuration
```javascript
// tailark.config.js
export default {
  theme: {
    colors: {
      primary: '#5b6cf6',
      secondary: '#f3f4f6',
      foreground: '#1f2937',
      background: '#ffffff',
      muted: '#6b7280'
    },
    components: {
      card: {
        base: 'rounded-xl bg-foreground/5 ring-1 ring-foreground/5',
        hover: 'hover:shadow-lg hover:ring-primary/20'
      },
      badge: {
        base: 'rounded-lg px-2.5 py-1 text-xs font-medium',
        secondary: 'bg-foreground/5 ring-1 ring-foreground/10 text-foreground'
      }
    }
  }
}
```

#### 4.2 shadcn/ui Theme Integration
```css
/* app/styles/globals.css */
@import "tailark/base";
@import "tailark/components";
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --primary: 234 89% 74%;
    --primary-foreground: 0 0% 100%;
    --secondary: 214 32% 91%;
    --secondary-foreground: 222 47% 11%;
    --muted: 220 14% 46%;
    --muted-foreground: 220 9% 46%;
    --accent: 216 34% 17%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 234 89% 74%;
    --radius: 0.75rem;
  }
}
```

### Phase 5: Build & Deployment (Week 4)

#### 5.1 Static Build Configuration
```json
// package.json scripts
{
  "scripts": {
    "dev": "remix vite:dev",
    "build": "npm run scrape && npm run build:remix && npm run build:static",
    "build:remix": "remix vite:build",
    "build:static": "remix-serve ./build/server/index.js",
    "scrape": "tsx src/scrapers/scrape.ts",
    "preview": "vite preview"
  }
}
```

#### 5.2 Static Adapter Configuration
```typescript
// remix.config.js
export default {
  adapter: '@remix-run/static-adapter',
  staticAdapter: {
    routes: [
      '/',
      '/guide'
    ]
  }
}
```

#### 5.3 GitHub Actions Workflow
```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 */6 * * *'  # Run every 6 hours

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Scrape community data
        run: npm run scrape

      - name: Build site
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build/client
```

## Migration Checklist

### Pre-Migration
- [ ] Backup current Jekyll site
- [ ] Document current deployment process
- [ ] Inventory all custom JavaScript (navbar.js, tooltip.js)
- [ ] List all environment variables and secrets

### Phase 1: Setup
- [ ] Initialize Remix project with Vite
- [ ] Configure TypeScript
- [ ] Install shadcn/ui
- [ ] Install and configure Tailark
- [ ] Setup ESLint and Prettier

### Phase 2: Components
- [ ] Create root layout (app/root.tsx)
- [ ] Convert Header component
- [ ] Convert Footer component
- [ ] Create CommunityCard with shadcn/ui
- [ ] Implement analytics component
- [ ] Add tooltip functionality

### Phase 3: Routes
- [ ] Create index route with event listings
- [ ] Create guide route (MDX or markdown)
- [ ] Setup 404 page
- [ ] Add meta tags and SEO
- [ ] Implement RSS feed generation

### Phase 4: Data
- [ ] Convert YAML output to JSON
- [ ] Create data loading utilities
- [ ] Implement static data fetching
- [ ] Test scraper integration
- [ ] Add error handling

### Phase 5: Styling
- [ ] Configure Tailark theme
- [ ] Setup shadcn/ui components
- [ ] Migrate custom CSS
- [ ] Implement dark mode support
- [ ] Test responsive design

### Phase 6: Features
- [ ] Port navbar.js functionality
- [ ] Port tooltip.js functionality
- [ ] Add search functionality
- [ ] Implement filtering by tags
- [ ] Add community submission form

### Phase 7: Testing
- [ ] Unit tests for components
- [ ] Integration tests for routes
- [ ] Test scraper functionality
- [ ] Lighthouse performance audit
- [ ] Cross-browser testing

### Phase 8: Deployment
- [ ] Configure static build
- [ ] Setup GitHub Actions
- [ ] Test deployment pipeline
- [ ] Configure CDN/caching
- [ ] Monitor for issues

## Benefits of Migration

### Developer Experience
- **Modern Stack**: React ecosystem with TypeScript
- **Component Library**: Pre-built, accessible components via shadcn/ui
- **Design System**: Consistent styling with Tailark
- **Hot Module Replacement**: Faster development with Vite
- **Type Safety**: Full TypeScript support

### Performance
- **Optimized Builds**: Vite's efficient bundling
- **Code Splitting**: Automatic route-based splitting
- **Asset Optimization**: Built-in image optimization
- **Edge Ready**: Can deploy to edge networks

### Maintainability
- **Component Reusability**: React components vs Liquid templates
- **Better Testing**: Jest/Vitest integration
- **Modern Tooling**: ESLint, Prettier, TypeScript
- **Active Community**: Remix/React ecosystem

## Risk Mitigation

### Potential Risks
1. **Data Migration**: Ensure scrapers continue working
2. **SEO Impact**: Maintain URL structure and meta tags
3. **Build Time**: Monitor static generation performance
4. **Browser Support**: Test on target browsers

### Mitigation Strategies
1. **Parallel Development**: Keep Jekyll site running during migration
2. **Incremental Migration**: Test each phase thoroughly
3. **Rollback Plan**: Maintain ability to revert to Jekyll
4. **Monitoring**: Setup error tracking and analytics

## Timeline

| Week | Phase | Deliverables |
|------|-------|-------------|
| 1 | Setup & Planning | Remix project initialized, dependencies installed |
| 2 | Component Migration | All UI components converted to React |
| 3 | Data & Routes | Routes implemented, data pipeline working |
| 4 | Styling & Features | Tailark/shadcn styling complete, features ported |
| 5 | Testing & Optimization | Tests written, performance optimized |
| 6 | Deployment | Production deployment, monitoring setup |

## High-Level Execution Plan

This execution plan is designed for coordinating multiple subagents working in parallel. Each execution block specifies tasks that can be run simultaneously and their dependencies.

### Execution Block 1: Foundation Setup (Sequential)
**Dependencies**: None
**Execution**: Must be completed first, run sequentially

```yaml
tasks:
  - id: remix-init
    description: Initialize Remix project with Vite template
    commands:
      - npx create-remix@latest remix --template remix-run/remix/templates/vite
      - cd remix && npm install
    output: New Remix project directory

  - id: core-dependencies
    description: Install core UI and styling dependencies
    depends_on: [remix-init]
    commands:
      - npx shadcn@latest init
      - npm install tailark lucide-react
      - npm install -D @types/js-yaml
    output: Updated package.json with dependencies
```

### Execution Block 2: Parallel Infrastructure Setup
**Dependencies**: Execution Block 1 complete
**Execution**: Run all tasks in parallel with 3 subagents

```yaml
parallel_tasks:
  subagent_1:
    - id: component-scaffolding
      description: Create component directory structure and base components
      tasks:
        - Create app/components/layout/ directory
        - Create app/components/cards/ directory
        - Create app/components/ui/ directory (for shadcn)
        - Setup base component exports
      output: Component directory structure

  subagent_2:
    - id: data-pipeline-setup
      description: Setup data loading infrastructure
      tasks:
        - Create app/lib/scrapers/ directory
        - Copy existing scrapers from src/scrapers/
        - Create app/lib/data.server.ts with YAML/JSON loaders
        - Setup type definitions for Community and Event data
      output: Data pipeline foundation

  subagent_3:
    - id: styling-configuration
      description: Configure Tailwind, Tailark, and global styles
      tasks:
        - Configure tailwind.config.js with Tailark
        - Create tailark.config.js with theme tokens
        - Setup app/styles/globals.css
        - Configure CSS variables for shadcn/ui
      output: Complete styling configuration
```

### Execution Block 3: Component Migration (Parallel)
**Dependencies**: Execution Block 2 complete
**Execution**: Run all tasks in parallel with 4 subagents

```yaml
parallel_tasks:
  subagent_1:
    - id: layout-components
      description: Convert Jekyll layout components to React
      input_files:
        - site/_layouts/default.html
        - site/_includes/header.html
        - site/_includes/footer.html
      output_files:
        - app/root.tsx
        - app/components/layout/Header.tsx
        - app/components/layout/Footer.tsx
      tasks:
        - Convert HTML to JSX syntax
        - Replace Liquid variables with React props
        - Implement responsive navigation
        - Add TypeScript interfaces

  subagent_2:
    - id: card-component
      description: Create CommunityCard component with shadcn/ui
      input_files:
        - site/_includes/card.html
      output_files:
        - app/components/cards/CommunityCard.tsx
      tasks:
        - Implement using shadcn Card component
        - Add Badge components for tags
        - Use Lucide icons for calendar, map, users
        - Add hover states and transitions

  subagent_3:
    - id: utility-components
      description: Create utility components and helpers
      input_files:
        - site/_includes/analytics.html
        - site/assets/js/tooltip.js
      output_files:
        - app/components/Analytics.tsx
        - app/components/Tooltip.tsx
        - app/lib/utils.ts
      tasks:
        - Convert analytics to React component
        - Implement tooltip with Radix UI
        - Create utility functions for date formatting

  subagent_4:
    - id: static-assets
      description: Migrate static assets and public files
      tasks:
        - Copy site/assets/logos/ to public/assets/logos/
        - Copy site/assets/icons/ to public/assets/icons/
        - Copy site/assets/favicons/ to public/assets/favicons/
        - Copy site/assets/social/ to public/social/
        - Update asset references in components
      output: All static assets migrated
```

### Execution Block 4: Routes and Data Integration (Parallel)
**Dependencies**: Execution Block 3 complete
**Execution**: Run all tasks in parallel with 3 subagents

```yaml
parallel_tasks:
  subagent_1:
    - id: main-routes
      description: Create main application routes
      output_files:
        - app/routes/_index.tsx
        - app/routes/guide.tsx
        - app/routes/404.tsx
      tasks:
        - Implement homepage with event filtering
        - Convert guide.md to guide.tsx (MDX or markdown-to-JSX)
        - Create 404 error page
        - Add meta tags and SEO for each route

  subagent_2:
    - id: data-integration
      description: Integrate data loading with routes
      tasks:
        - Implement loader functions for each route
        - Create getCommunities() and getEvents() functions
        - Add error boundaries for data loading
        - Setup caching strategy for static data
      output: Complete data loading integration

  subagent_3:
    - id: scraper-modernization
      description: Update scrapers for JSON output
      input_files:
        - src/scrapers/*.ts
      tasks:
        - Modify output format from YAML to JSON
        - Update file paths for new structure
        - Add TypeScript types for all data
        - Create npm scripts for scraping
      output: Modernized scraper system
```

### Execution Block 5: Features and Polish (Parallel)
**Dependencies**: Execution Block 4 complete
**Execution**: Run all tasks in parallel with 2 subagents

```yaml
parallel_tasks:
  subagent_1:
    - id: interactive-features
      description: Implement interactive features
      input_files:
        - site/assets/js/navbar.js
      tasks:
        - Port navbar.js functionality to React
        - Add search/filter functionality
        - Implement theme toggle (dark mode)
        - Add smooth scroll behaviors
        - Create loading states and skeletons
      output: All interactive features implemented

  subagent_2:
    - id: build-configuration
      description: Configure build and deployment
      tasks:
        - Setup static site generation in vite.config.ts
        - Configure remix.config.js for SSG
        - Create build scripts in package.json
        - Setup GitHub Actions workflow
        - Configure environment variables
      output: Complete build pipeline
```

### Execution Block 6: Testing and Optimization (Sequential)
**Dependencies**: All previous blocks complete
**Execution**: Run sequentially for final validation

```yaml
tasks:
  - id: testing-setup
    description: Setup and run tests
    tasks:
      - Setup Vitest configuration
      - Write component tests
      - Write route tests
      - Test data loading functions
      - Run full test suite
    output: All tests passing

  - id: performance-optimization
    description: Optimize build and runtime performance
    depends_on: [testing-setup]
    tasks:
      - Run Lighthouse audit
      - Optimize bundle sizes
      - Implement lazy loading
      - Configure caching headers
      - Minify static assets
    output: Optimized production build

  - id: final-validation
    description: Final validation before deployment
    depends_on: [performance-optimization]
    tasks:
      - Build production bundle
      - Test all routes locally
      - Verify data pipeline works
      - Check responsive design
      - Validate SEO and meta tags
    output: Production-ready application
```

### Subagent Coordination Instructions

#### For Each Execution Block:

1. **Block 1**: Run with single agent sequentially
2. **Block 2**: Launch 3 parallel agents, each handling their assigned infrastructure task
3. **Block 3**: Launch 4 parallel agents for component migration
4. **Block 4**: Launch 3 parallel agents for routes and data
5. **Block 5**: Launch 2 parallel agents for features and build setup
6. **Block 6**: Run with single agent for final testing

#### Communication Protocol:

```typescript
interface SubagentTask {
  blockId: number
  agentId: string
  taskId: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  dependencies: string[]
  output: {
    files: string[]
    notes: string
    errors?: string[]
  }
}
```

#### Dependency Management:

- No block can start until all tasks in the previous block are completed
- Within a block, all parallel tasks can run simultaneously
- If any task fails, halt execution and report the error
- Each subagent should validate their inputs before starting

#### Success Validation:

After each block completes:
1. Verify all expected output files exist
2. Run basic validation (TypeScript compilation, ESLint)
3. Check for any reported errors
4. Confirm dependencies for next block are met

### Execution Summary

**Total Execution Blocks**: 6
**Maximum Parallel Agents**: 4 (in Block 3)
**Critical Path**: Blocks 1 → 6 must run sequentially
**Parallel Opportunities**: Blocks 2, 3, 4, 5 contain parallel tasks

**Estimated Timeline with Subagents**:
- Block 1: 30 minutes (sequential)
- Block 2: 1 hour (3 parallel agents)
- Block 3: 2 hours (4 parallel agents)
- Block 4: 2 hours (3 parallel agents)
- Block 5: 1.5 hours (2 parallel agents)
- Block 6: 1 hour (sequential)

**Total Estimated Time**: ~7.5 hours with parallel execution (vs ~20 hours sequential)

## Success Criteria

- [ ] All existing functionality preserved
- [ ] Page load time < 2 seconds
- [ ] Lighthouse score > 90
- [ ] Zero runtime errors in production
- [ ] Successful daily scraping runs
- [ ] Improved developer documentation

## Next Steps

1. Review and approve migration plan
2. Set up development environment
3. Create feature branch for migration
4. Begin Phase 1 implementation
5. Schedule weekly progress reviews

## Resources

- [Remix Documentation](https://remix.run/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailark Documentation](https://tailark.com/docs)
- [Vite Static Site Generation](https://vitejs.dev/guide/ssr.html)
- [React Router v7](https://reactrouter.com/en/main)

## Appendix

### File Mapping Reference

| Jekyll File | Remix Equivalent |
|------------|-----------------|
| `site/_config.yml` | `remix.config.js` |
| `site/_data/*.yml` | `app/data/*.json` |
| `site/_includes/*.html` | `app/components/*.tsx` |
| `site/_layouts/*.html` | `app/root.tsx` + route layouts |
| `site/assets/*` | `public/assets/*` |
| `site/*.html` | `app/routes/*.tsx` |
| `Gemfile` | Removed (no Ruby dependency) |
| `_site/` | `build/client/` |

### Command Migration

| Jekyll Command | Remix Equivalent |
|---------------|-----------------|
| `jekyll serve` | `npm run dev` |
| `jekyll build` | `npm run build` |
| `bundle install` | `npm install` |

### Environment Variables

```env
# .env.local
NODE_ENV=development
VITE_SITE_URL=http://localhost:3000

# .env.production
NODE_ENV=production
VITE_SITE_URL=https://techtribes.fi
```