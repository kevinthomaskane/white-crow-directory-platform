export function DocsCreatingSiteSection() {
  return (
    <section id="creating-a-site" className="scroll-mt-8">
      <h2 className="mb-6 border-b pb-2 text-2xl font-bold">
        3. Creating a New Site
      </h2>
      <p className="mb-8 text-muted-foreground">
        This guide walks through the complete process of setting up a new
        directory site, from defining the vertical to populating it with
        businesses.
      </p>

      <div className="space-y-8">
        {/* Step 1: Define a Vertical */}
        <article id="step-1-vertical" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">3.1 Define a Vertical</h3>
          <p className="mb-4 text-muted-foreground">
            Before creating a site, you need a vertical that defines the
            industry focus. Navigate to{' '}
            <a
              href="/admin/verticals"
              className="text-primary hover:underline"
            >
              Admin → Verticals
            </a>{' '}
            to create one.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">When creating a vertical:</h4>
            <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>
                Choose a descriptive <strong>name</strong> (e.g.,
                &quot;Lawyers&quot;, &quot;Plumbers&quot;)
              </li>
              <li>
                The <strong>slug</strong> will be auto-generated and used as the
                URL base path (e.g., &quot;/lawyers/...&quot;)
              </li>
              <li>
                Customize terminology to match your industry:
                <ul className="ml-6 mt-1 list-inside list-disc">
                  <li>
                    &quot;Business&quot; → &quot;Attorney&quot;,
                    &quot;Contractor&quot;, etc.
                  </li>
                  <li>
                    &quot;Category&quot; → &quot;Practice Area&quot;,
                    &quot;Service Type&quot;, etc.
                  </li>
                  <li>
                    &quot;Find a Business&quot; → &quot;Find a Lawyer&quot;,
                    etc.
                  </li>
                </ul>
              </li>
            </ol>
          </div>
        </article>

        {/* Step 2: Create Categories */}
        <article id="step-2-categories" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">3.2 Create Categories</h3>
          <p className="mb-4 text-muted-foreground">
            Categories subdivide your vertical and help users find specific
            types of businesses. Navigate to{' '}
            <a
              href="/admin/categories"
              className="text-primary hover:underline"
            >
              Admin → Categories
            </a>{' '}
            to create categories for your vertical.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">Category setup tips:</h4>
            <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
              <li>
                Select the <strong>vertical</strong> the category belongs to
              </li>
              <li>
                Choose category names that match Google Places search terms for
                better results
              </li>
              <li>
                The slug is used in URLs:{' '}
                <code className="rounded bg-muted px-1">
                  /lawyers/personal-injury
                </code>
              </li>
              <li>
                You can create multiple categories - they&apos;ll all be
                available when creating sites
              </li>
            </ul>
          </div>
        </article>

        {/* Step 3: Create the Site */}
        <article id="step-3-site-form" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">3.3 Create the Site</h3>
          <p className="mb-4 text-muted-foreground">
            Navigate to{' '}
            <a
              href="/admin/sites/create"
              className="text-primary hover:underline"
            >
              Admin → Sites → Create
            </a>{' '}
            to set up your new directory site.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">Site creation form fields:</h4>
            <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Name</strong> - Display name for the site (e.g.,
                &quot;Chicago Lawyers Directory&quot;)
              </li>
              <li>
                <strong>Domain</strong> - The domain this site will respond to
                (e.g., &quot;chicagolawyers.com&quot;)
              </li>
              <li>
                <strong>Vertical</strong> - Select the vertical you created
              </li>
              <li>
                <strong>State</strong> - Geographic focus for the directory
              </li>
              <li>
                <strong>Categories</strong> - Select which categories to include
                on this site
              </li>
              <li>
                <strong>Cities</strong> - Select which cities to target for
                business searches
              </li>
              <li>
                <strong>Branding</strong> - Upload logo, favicon, and hero
                images
              </li>
            </ul>
          </div>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
            <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">
              What happens when you submit:
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              When you submit the form, the system creates a{' '}
              <strong>job</strong> record in the{' '}
              <code className="rounded bg-blue-100 px-1 dark:bg-blue-900">
                jobs
              </code>{' '}
              table. This job contains all the information needed to fetch
              businesses from Google Places API for each category/city
              combination you selected.
            </p>
          </div>
        </article>

        {/* Step 4: Job Processing */}
        <article id="step-4-job-processing" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">3.4 Job Processing</h3>
          <p className="mb-4 text-muted-foreground">
            The platform uses a background worker to process jobs
            asynchronously. This keeps the admin interface responsive while
            potentially long-running API calls happen in the background.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">How the job system works:</h4>
            <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>
                A job is created with status{' '}
                <code className="rounded bg-muted px-1">pending</code> and a
                payload containing site ID, categories, and cities
              </li>
              <li>
                The <strong>worker</strong> (a separate Node.js process) polls
                for pending jobs using the{' '}
                <code className="rounded bg-muted px-1">claim_next_job</code>{' '}
                database function
              </li>
              <li>
                When claimed, the job status changes to{' '}
                <code className="rounded bg-muted px-1">processing</code>
              </li>
              <li>
                The worker calls Google Places API for each category/city
                combination, saving businesses to the database
              </li>
              <li>
                Progress is updated in the{' '}
                <code className="rounded bg-muted px-1">progress</code> field
                (0-100)
              </li>
              <li>
                On completion, status changes to{' '}
                <code className="rounded bg-muted px-1">completed</code> (or{' '}
                <code className="rounded bg-muted px-1">failed</code> if errors
                occurred)
              </li>
            </ol>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">Job statuses:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <code className="rounded bg-yellow-100 px-1 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    pending
                  </code>{' '}
                  - Waiting to be picked up
                </li>
                <li>
                  <code className="rounded bg-blue-100 px-1 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    processing
                  </code>{' '}
                  - Currently running
                </li>
                <li>
                  <code className="rounded bg-green-100 px-1 text-green-800 dark:bg-green-900 dark:text-green-200">
                    completed
                  </code>{' '}
                  - Finished successfully
                </li>
                <li>
                  <code className="rounded bg-red-100 px-1 text-red-800 dark:bg-red-900 dark:text-red-200">
                    failed
                  </code>{' '}
                  - Encountered an error
                </li>
              </ul>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">Monitor jobs:</h4>
              <p className="text-sm text-muted-foreground">
                View job status at{' '}
                <a href="/admin/jobs" className="text-primary hover:underline">
                  Admin → Jobs
                </a>
                . You can see progress, errors, and retry failed jobs.
              </p>
            </div>
          </div>
        </article>

        {/* Step 5: Search Index Sync */}
        <article id="step-5-search-sync" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">3.5 Search Index Sync</h3>
          <p className="mb-4 text-muted-foreground">
            After businesses are saved to the database, they need to be synced
            to the Typesense search index for fast, full-text search
            capabilities on the public site.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">Typesense integration:</h4>
            <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
              <li>
                Typesense runs in a separate Docker container alongside the
                application
              </li>
              <li>
                Once the job completes, trigger a sync to push business data to
                the search index
              </li>
              <li>
                The search index enables fast autocomplete and filtering on the
                public directory pages
              </li>
              <li>Re-sync after making bulk changes to business data</li>
            </ul>
          </div>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
            <h4 className="mb-2 font-medium text-amber-800 dark:text-amber-200">
              Note:
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              The Typesense Docker container must be running for search
              functionality to work. Check your Docker setup if search
              isn&apos;t returning results.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
