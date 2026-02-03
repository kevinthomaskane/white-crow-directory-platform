export function DocsManagingSiteSection() {
  return (
    <section id="managing-a-site" className="scroll-mt-8">
      <h2 className="mb-6 border-b pb-2 text-2xl font-bold">
        4. Managing a Site
      </h2>
      <p className="mb-8 text-muted-foreground">
        Once a site is created, you can manage it from the site detail page.
        Navigate to{' '}
        <a href="/admin/sites" className="text-primary hover:underline">
          Admin → Sites
        </a>{' '}
        and click on a site to access its management interface.
      </p>

      <div className="space-y-8">
        {/* Overview Stats */}
        <article id="site-overview" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">4.1 Site Overview</h3>
          <p className="mb-4 text-muted-foreground">
            The top of the site detail page displays key statistics:
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Vertical</strong> - The industry vertical this site
                belongs to
              </li>
              <li>
                <strong>State</strong> - The geographic focus of the site
              </li>
              <li>
                <strong>Categories</strong> - Number of categories configured
              </li>
              <li>
                <strong>Businesses</strong> - Total businesses in this
                site&apos;s directory
              </li>
            </ul>
          </div>
        </article>

        {/* Categories & Cities */}
        <article id="site-categories-cities" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">
            4.2 Categories & Cities
          </h3>
          <p className="mb-4 text-muted-foreground">
            Manage which categories and cities are included in your directory.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">Categories:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>View all categories currently on the site</li>
                <li>Add new categories from the vertical using the dropdown</li>
                <li>
                  Adding a category will automatically trigger a background job
                  to search for businesses in that category for each city on the
                  site
                </li>
              </ul>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">Cities:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>View cities covered by this site (up to 20 shown)</li>
                <li>Add new cities from the state using the dropdown</li>
                <li>
                  Adding a city will automatically trigger a background job to
                  search for businesses in that city for each category on the
                  site
                </li>
              </ul>
            </div>
          </div>
        </article>

        {/* Search Index */}
        <article id="site-search-index" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">4.3 Search Index</h3>
          <p className="mb-4 text-muted-foreground">
            The search index powers fast, full-text search on the public site.
            Businesses must be synced to Typesense for search to work.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">Sync status indicators:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <code className="rounded bg-green-100 px-1 text-green-800 dark:bg-green-900 dark:text-green-200">
                  completed
                </code>
                <span>
                  - Last sync finished successfully, shows count of indexed
                  businesses
                </span>
              </li>
              <li className="flex items-center gap-2">
                <code className="rounded bg-blue-100 px-1 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  processing
                </code>
                <span>
                  - Sync is currently running, shows progress percentage
                </span>
              </li>
              <li className="flex items-center gap-2">
                <code className="rounded bg-yellow-100 px-1 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  pending
                </code>
                <span>- Sync job is queued, waiting for worker</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="rounded bg-red-100 px-1 text-red-800 dark:bg-red-900 dark:text-red-200">
                  failed
                </code>
                <span>- Sync encountered an error, displays error message</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">When to sync:</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>After initial site creation and job completion</li>
              <li>After adding new categories or cities</li>
              <li>After refreshing business data</li>
              <li>After approving business submissions</li>
            </ul>
          </div>
        </article>

        {/* Business Data */}
        <article id="site-business-data" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">4.4 Business Data</h3>
          <p className="mb-4 text-muted-foreground">
            Refresh business data from Google Places API to get the latest
            information.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">What gets refreshed:</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Ratings and review counts</li>
              <li>Individual reviews</li>
              <li>Operating hours</li>
              <li>Contact information (phone, website)</li>
              <li>Address and location data</li>
              <li>Photos</li>
            </ul>
          </div>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
            <h4 className="mb-2 font-medium text-amber-800 dark:text-amber-200">
              Important:
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Refreshing business data makes API calls to Google Places for each
              business. This consumes API quota and may take time for sites with
              many businesses. Consider running during off-peak hours for large
              sites.
            </p>
          </div>
        </article>

        {/* Site Assets */}
        <article id="site-assets" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">4.5 Site Assets</h3>
          <p className="mb-4 text-muted-foreground">
            Upload branding assets to customize the site&apos;s appearance.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">Available uploads:</h4>
            <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Hero Image</strong> - Large banner image displayed on
                the homepage
              </li>
              <li>
                <strong>Logo</strong> - Site logo displayed in the header and
                footer
              </li>
              <li>
                <strong>Favicon</strong> - Small icon displayed in browser tabs
              </li>
            </ul>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Assets are stored in Supabase Storage and served via CDN. Uploading
            a new asset automatically replaces the previous one.
          </p>
        </article>

        {/* Business Submissions */}
        <article id="site-submissions" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">
            4.6 Business Submissions
          </h3>
          <p className="mb-4 text-muted-foreground">
            Review businesses submitted by users for inclusion in the directory.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">Submission workflow:</h4>
            <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>
                User submits a business via the public &quot;Submit
                Business&quot; form
              </li>
              <li>
                Submission appears here with{' '}
                <code className="rounded bg-yellow-100 px-1 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  pending
                </code>{' '}
                status
              </li>
              <li>
                Admin reviews the submission details (name, email, website,
                category, city)
              </li>
              <li>
                <strong>Approve</strong>: Business is enriched with Google
                Places data and added to the directory. An email notification is
                sent to the submitter.
              </li>
              <li>
                <strong>Reject</strong>: Submission is marked as rejected and
                not added to the directory.
              </li>
            </ol>
          </div>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
            <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">
              After approval:
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Remember to sync the search index after approving submissions so
              the new businesses appear in search results.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
