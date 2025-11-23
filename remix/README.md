# Techtribes Remix

Modern React application for listing active tech communities and meetups in Finland.

## Tech Stack

- **Framework**: React 19 + Vite
- **Routing**: React Router v7
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **TypeScript**: Full type safety
- **Icons**: Lucide React

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Build Process

The build process includes:

1. **Scraping**: Fetches latest event data from community platforms
2. **TypeScript compilation**: Type-checks and compiles TypeScript
3. **Vite build**: Bundles and optimizes for production

### Build Scripts

```bash
# Full build with scraping (recommended)
npm run build

# Build without scraping
npm run build:only

# Scrape events to YAML
npm run scrape

# Scrape events to JSON
npm run scrape:json
```

### Important: Data File Requirements

The production build requires the `output.json` file to be present in `public/data/`.

**If you see "No events found" in the built site:**

1. Make sure you've run the scraper to generate the JSON file
2. The JSON file must be copied to the public directory before building

```bash
# From the root techtribes directory
npm run scrape                                   # Generate latest data
cp data/output.json remix/public/data/  # Copy JSON to public
cd remix
npm run build:only                               # Build the site
npm run preview                                  # Test locally at http://localhost:4173
```

**Or use the combined workflow (from remix directory):**

```bash
npm run build   # This runs scrape + build in one step
npm run preview # Test the build
```

## Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Footer
│   ├── cards/           # CommunityCard
│   └── ui/              # shadcn/ui components
├── routes/              # Page components
│   ├── HomePage.tsx
│   ├── GuidePage.tsx
│   └── NotFoundPage.tsx
├── lib/
│   ├── data.ts          # Data loading utilities
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Utility functions
└── App.tsx              # Main app with routing

public/
├── assets/
│   ├── logos/           # Community logos
│   ├── icons/           # Icon assets
│   └── favicons/        # Favicon files
└── data/
    ├── communities.yml  # Community definitions
    └── output.yml       # Scraped event data
```

## Migration from Jekyll

This is a modernized version of the original Jekyll-based Techtribes site. Key improvements:

- ✅ Modern React architecture with TypeScript
- ✅ Component-based UI with shadcn/ui
- ✅ Responsive design with Tailwind CSS
- ✅ Fast development with Vite HMR
- ✅ Client-side routing with React Router
- ✅ Improved developer experience

## Data Pipeline

1. Communities defined in `public/data/communities.yml`
2. Scrapers fetch event data from various platforms
3. Output saved to `public/data/output.yml` and `public/data/output.json`
4. React app loads and displays event data

## Deployment

The app can be deployed as a static site to any hosting platform:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

The build output is in the `dist/` directory after running `npm run build`.
