export function DocsTechStackSection() {
  return (
    <section id="tech-stack" className="scroll-mt-8">
      <h2 className="mb-6 border-b pb-2 text-2xl font-bold">
        5. Tech Stack & Architecture
      </h2>

      <div className="space-y-8">
        {/* Tech Stack Overview */}
        <article id="stack-overview" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">5.1 Tech Stack Overview</h3>
          <p className="mb-4 text-muted-foreground">
            The White Crow Directory Platform is built on a modern TypeScript
            stack optimized for multi-tenant directory sites.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">Frontend & Backend:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>Next.js 16</strong> - App Router for server-side
                  rendering and API routes
                </li>
                <li>
                  <strong>React 19</strong> - UI components with Server
                  Components
                </li>
                <li>
                  <strong>Tailwind CSS</strong> - Utility-first styling
                </li>
                <li>
                  <strong>shadcn/ui</strong> - Component library
                </li>
              </ul>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">Data & Search:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>Supabase</strong> - PostgreSQL database, auth, and
                  storage
                </li>
                <li>
                  <strong>Typesense</strong> - Fast, typo-tolerant search engine
                </li>
                <li>
                  <strong>Google Places API</strong> - Business data source
                </li>
              </ul>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">Build & Tooling:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>pnpm</strong> - Package manager with workspace support
                </li>
                <li>
                  <strong>TypeScript</strong> - End-to-end type safety
                </li>
                <li>
                  <strong>tsup</strong> - Fast bundling for worker and shared
                  package
                </li>
                <li>
                  <strong>Zod</strong> - Runtime schema validation
                </li>
              </ul>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">Infrastructure:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>Vercel</strong> - Next.js hosting (recommended)
                </li>
                <li>
                  <strong>Typesense Cloud</strong> - Managed search hosting
                </li>
                <li>
                  <strong>Supabase Cloud</strong> - Managed database hosting
                </li>
              </ul>
            </div>
          </div>
        </article>

        {/* Project Structure */}
        <article id="project-structure" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">5.2 Project Structure</h3>
          <p className="mb-4 text-muted-foreground">
            The platform uses a <strong>monorepo architecture</strong> managed
            with pnpm workspaces. This allows shared code and types across
            applications while maintaining clear separation of concerns.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <pre className="text-sm text-muted-foreground">
              {`white-crow-directory-platform/
├── apps/
│   ├── directory-engine/    # Next.js frontend & API
│   └── worker/              # Background job processor
├── packages/
│   └── shared/              # Shared types, clients, schemas
└── supabase/                # Database migrations & schema`}
            </pre>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="mb-2 font-medium">
                apps/directory-engine (Next.js App)
              </h4>
              <p className="mb-2 text-sm text-muted-foreground">
                The main application handling both admin UI and public directory
                sites.
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <code className="rounded bg-muted px-1">app/admin/</code> -
                  Admin dashboard for managing sites, categories, and jobs
                </li>
                <li>
                  <code className="rounded bg-muted px-1">app/[vertical]/</code>{' '}
                  - Dynamic routes for public directory pages
                </li>
                <li>
                  <code className="rounded bg-muted px-1">components/</code> -
                  Reusable UI components
                </li>
                <li>
                  <code className="rounded bg-muted px-1">lib/</code> - Utility
                  functions and Supabase clients
                </li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="mb-2 font-medium">apps/worker (Job Processor)</h4>
              <p className="mb-2 text-sm text-muted-foreground">
                Long-running background process for data ingestion and
                processing.
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <code className="rounded bg-muted px-1">src/processors/</code>{' '}
                  - Job handlers for different job types
                </li>
                <li>
                  Claims jobs from the{' '}
                  <code className="rounded bg-muted px-1">jobs</code> table via{' '}
                  <code className="rounded bg-muted px-1">claim_next_job</code>{' '}
                  RPC
                </li>
                <li>
                  Handles Google Places API calls, data transformation, and
                  database writes
                </li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="mb-2 font-medium">packages/shared</h4>
              <p className="mb-2 text-sm text-muted-foreground">
                Shared code imported by both apps via{' '}
                <code className="rounded bg-muted px-1">@white-crow/shared</code>
                .
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <code className="rounded bg-muted px-1">
                    src/supabase/database.ts
                  </code>{' '}
                  - Auto-generated TypeScript types from Supabase schema
                </li>
                <li>
                  <code className="rounded bg-muted px-1">
                    src/supabase/service-role.ts
                  </code>{' '}
                  - Service role client for server-side operations
                </li>
                <li>
                  <code className="rounded bg-muted px-1">src/jobs/</code> - Zod
                  schemas for job payloads
                </li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="mb-2 font-medium">Typesense Search Index</h4>
              <p className="mb-2 text-sm text-muted-foreground">
                External search service for fast, typo-tolerant business search.
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  Each site has its own collection (e.g.,{' '}
                  <code className="rounded bg-muted px-1">
                    site_[site_id]_businesses
                  </code>
                  )
                </li>
                <li>
                  Indexes business name, address, categories for instant search
                </li>
                <li>Supports geo-search for location-based filtering</li>
              </ul>
            </div>
          </div>
        </article>

        {/* Deployment */}
        <article id="deployment" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">5.3 Deployment</h3>
          <p className="mb-4 text-muted-foreground">
            The platform consists of three separate deployable components, each
            with different hosting requirements.
          </p>

          <div className="mb-6 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <h4 className="mb-2 font-medium text-amber-600 dark:text-amber-400">
              Important: Separate Deployments Required
            </h4>
            <p className="text-sm text-muted-foreground">
              The Next.js app, Worker, and Typesense must be deployed
              independently. They communicate through the shared Supabase
              database and Typesense API.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                  1
                </span>
                <h4 className="font-medium">
                  Next.js App (directory-engine)
                </h4>
              </div>
              <p className="mb-2 text-sm text-muted-foreground">
                Serverless deployment with edge capabilities.
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>Recommended:</strong> Vercel (automatic deployments
                  from git)
                </li>
                <li>
                  <strong>Alternatives:</strong> Netlify, AWS Amplify, Cloudflare
                  Pages
                </li>
                <li>
                  <strong>Environment:</strong>{' '}
                  <code className="rounded bg-muted px-1">
                    NEXT_PUBLIC_SUPABASE_URL
                  </code>
                  ,{' '}
                  <code className="rounded bg-muted px-1">
                    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
                  </code>
                </li>
                <li>
                  Configure custom domains per site for multi-tenant routing
                </li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                  2
                </span>
                <h4 className="font-medium">Worker (Job Processor)</h4>
              </div>
              <p className="mb-2 text-sm text-muted-foreground">
                Long-running Node.js process that must stay alive to process
                jobs.
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>Recommended:</strong> Railway, Render, or a VPS
                  (DigitalOcean, Linode)
                </li>
                <li>
                  <strong>Not suitable:</strong> Serverless platforms (Vercel,
                  Netlify Functions)
                </li>
                <li>
                  <strong>Environment:</strong>{' '}
                  <code className="rounded bg-muted px-1">WORKER_ID</code>,{' '}
                  <code className="rounded bg-muted px-1">
                    GOOGLE_PLACES_API_KEY
                  </code>
                  ,{' '}
                  <code className="rounded bg-muted px-1">
                    SUPABASE_SERVICE_ROLE_KEY
                  </code>
                </li>
                <li>Run with process manager (PM2) for auto-restart</li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400">
                  3
                </span>
                <h4 className="font-medium">Typesense Search</h4>
              </div>
              <p className="mb-2 text-sm text-muted-foreground">
                Search engine requiring persistent storage and low latency.
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>Recommended:</strong> Typesense Cloud (managed service)
                </li>
                <li>
                  <strong>Self-hosted:</strong> Docker on a VPS with persistent
                  volume
                </li>
                <li>
                  <strong>Environment:</strong>{' '}
                  <code className="rounded bg-muted px-1">TYPESENSE_HOST</code>,{' '}
                  <code className="rounded bg-muted px-1">
                    TYPESENSE_API_KEY
                  </code>
                </li>
                <li>
                  Choose a region close to your users for optimal search latency
                </li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
                  4
                </span>
                <h4 className="font-medium">Supabase (Database)</h4>
              </div>
              <p className="mb-2 text-sm text-muted-foreground">
                PostgreSQL database, authentication, and file storage.
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>Recommended:</strong> Supabase Cloud (managed)
                </li>
                <li>
                  <strong>Self-hosted:</strong> Supabase self-hosted or plain
                  PostgreSQL
                </li>
                <li>All apps connect to the same Supabase instance</li>
                <li>
                  Run <code className="rounded bg-muted px-1">pnpm supabase:types</code> to regenerate types after schema changes
                </li>
              </ul>
            </div>
          </div>
        </article>

        {/* Data Flow */}
        <article id="data-flow" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">5.4 Data Flow</h3>
          <p className="mb-4 text-muted-foreground">
            Understanding how data moves between components helps with debugging
            and extending the platform.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <pre className="text-sm text-muted-foreground">
              {`┌─────────────────┐     ┌─────────────────┐
│   Admin UI      │────▶│   Supabase      │
│  (Next.js)      │◀────│   (PostgreSQL)  │
└─────────────────┘     └────────┬────────┘
                                 │
┌─────────────────┐              │
│   Worker        │◀─────────────┘
│  (Job Processor)│       (polls for jobs)
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Google Places  │     │   Typesense     │
│      API        │     │   (Search)      │
└─────────────────┘     └────────▲────────┘
                                 │
┌─────────────────┐              │
│   Public Site   │──────────────┘
│   (Next.js)     │       (search queries)
└─────────────────┘`}
            </pre>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>1.</strong> Admin creates a site and triggers a data sync
              job
            </p>
            <p>
              <strong>2.</strong> Worker claims the job from Supabase and
              fetches data from Google Places API
            </p>
            <p>
              <strong>3.</strong> Worker writes business data to Supabase and
              syncs to Typesense
            </p>
            <p>
              <strong>4.</strong> Public site queries Supabase for pages and
              Typesense for search
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
