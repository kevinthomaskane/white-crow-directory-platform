export function DocsCoreConceptsSection() {
  return (
    <section id="core-concepts" className="scroll-mt-8">
      <h2 className="mb-6 border-b pb-2 text-2xl font-bold">
        1. Core Concepts
      </h2>

      <div className="space-y-8">
        {/* Verticals */}
        <article id="verticals" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">1.1 Verticals</h3>
          <p className="mb-4 text-muted-foreground">
            A <strong>vertical</strong> represents an industry or business type
            that your directory focuses on. Examples include
            &quot;Lawyers&quot;, &quot;Restaurants&quot;, or &quot;Home
            Services&quot;.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">Key Fields:</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>
                <code className="rounded bg-muted px-1">name</code> - Display
                name (e.g., &quot;Lawyers&quot;)
              </li>
              <li>
                <code className="rounded bg-muted px-1">slug</code> - URL
                segment (e.g., &quot;lawyers&quot;) - used as the base path for
                directory routes
              </li>
              <li>
                <code className="rounded bg-muted px-1">term_business</code> /
                <code className="rounded bg-muted px-1">term_businesses</code> -
                Custom terminology (e.g., &quot;Attorney&quot; /
                &quot;Attorneys&quot;)
              </li>
              <li>
                <code className="rounded bg-muted px-1">term_category</code> /
                <code className="rounded bg-muted px-1">term_categories</code> -
                Custom terminology (e.g., &quot;Practice Area&quot; /
                &quot;Practice Areas&quot;)
              </li>
              <li>
                <code className="rounded bg-muted px-1">term_cta</code> -
                Call-to-action text (e.g., &quot;Find a Lawyer&quot;)
              </li>
            </ul>
          </div>
        </article>

        {/* Categories */}
        <article id="categories" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">1.2 Categories</h3>
          <p className="mb-4 text-muted-foreground">
            <strong>Categories</strong> are subdivisions within a vertical. For
            a &quot;Lawyers&quot; vertical, categories might include
            &quot;Personal Injury&quot;, &quot;Family Law&quot;, or
            &quot;Criminal Defense&quot;.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">Key Fields:</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>
                <code className="rounded bg-muted px-1">vertical_id</code> -
                Parent vertical this category belongs to
              </li>
              <li>
                <code className="rounded bg-muted px-1">name</code> - Display
                name
              </li>
              <li>
                <code className="rounded bg-muted px-1">slug</code> - URL
                segment (unique per vertical)
              </li>
            </ul>
          </div>
        </article>

        {/* Businesses */}
        <article id="businesses" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">1.3 Businesses</h3>
          <p className="mb-4 text-muted-foreground">
            <strong>Businesses</strong> are the core entities in the directory.
            They are typically imported from Google Places API and contain
            location, contact, and operational information.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">Key Fields:</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>
                <code className="rounded bg-muted px-1">place_id</code> - Google
                Places ID (unique identifier from Google)
              </li>
              <li>
                <code className="rounded bg-muted px-1">name</code> - Business
                name
              </li>
              <li>
                <code className="rounded bg-muted px-1">formatted_address</code>
                ,{' '}
                <code className="rounded bg-muted px-1">street_address</code>,{' '}
                <code className="rounded bg-muted px-1">city</code>,{' '}
                <code className="rounded bg-muted px-1">state</code>,{' '}
                <code className="rounded bg-muted px-1">postal_code</code> -
                Address components
              </li>
              <li>
                <code className="rounded bg-muted px-1">phone</code>,{' '}
                <code className="rounded bg-muted px-1">website</code> - Contact
                info
              </li>
              <li>
                <code className="rounded bg-muted px-1">latitude</code>,{' '}
                <code className="rounded bg-muted px-1">longitude</code> - Geo
                coordinates for map display
              </li>
              <li>
                <code className="rounded bg-muted px-1">hours</code> - JSONB
                field with operating hours
              </li>
              <li>
                <code className="rounded bg-muted px-1">raw</code> - Complete
                Google Places API response for reference
              </li>
            </ul>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Businesses are linked to categories via the{' '}
            <code className="rounded bg-muted px-1">business_categories</code>{' '}
            join table, allowing a business to belong to multiple categories.
          </p>
        </article>

        {/* Sites */}
        <article id="sites" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">1.4 Sites</h3>
          <p className="mb-4 text-muted-foreground">
            <strong>Sites</strong> are individual directory websites. The
            platform is multi-tenant, meaning one installation can power many
            different directory sites, each with its own domain, branding, and
            subset of businesses.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">Key Fields:</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>
                <code className="rounded bg-muted px-1">domain</code> - The
                domain this site responds to (e.g.,
                &quot;chicagolawyers.com&quot;)
              </li>
              <li>
                <code className="rounded bg-muted px-1">name</code> - Site
                display name
              </li>
              <li>
                <code className="rounded bg-muted px-1">vertical_id</code> - The
                vertical this site is built around
              </li>
              <li>
                <code className="rounded bg-muted px-1">state_id</code> -
                Geographic focus of the site
              </li>
              <li>
                <code className="rounded bg-muted px-1">hero_path</code>,{' '}
                <code className="rounded bg-muted px-1">logo_path</code>,{' '}
                <code className="rounded bg-muted px-1">favicon_path</code> -
                Branding assets
              </li>
            </ul>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Each site has its own selection of categories (via{' '}
            <code className="rounded bg-muted px-1">site_categories</code>),
            cities (via{' '}
            <code className="rounded bg-muted px-1">site_cities</code>), and
            businesses (via{' '}
            <code className="rounded bg-muted px-1">site_businesses</code>).
          </p>
        </article>

        {/* Geography */}
        <article id="geography" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">
            1.5 Geography (States & Cities)
          </h3>
          <p className="mb-4 text-muted-foreground">
            Geographic data is organized into <strong>States</strong> and{' '}
            <strong>Cities</strong>. Sites are scoped to a state, and businesses
            are linked to cities for location-based filtering.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">States:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <code className="rounded bg-muted px-1">name</code> - Full
                  name (e.g., &quot;California&quot;)
                </li>
                <li>
                  <code className="rounded bg-muted px-1">code</code> -
                  Abbreviation (e.g., &quot;CA&quot;)
                </li>
              </ul>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">Cities:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <code className="rounded bg-muted px-1">name</code> - City
                  name
                </li>
                <li>
                  <code className="rounded bg-muted px-1">state_id</code> -
                  Parent state
                </li>
                <li>
                  <code className="rounded bg-muted px-1">latitude</code>,{' '}
                  <code className="rounded bg-muted px-1">longitude</code> -
                  Center coordinates
                </li>
                <li>
                  <code className="rounded bg-muted px-1">population</code> -
                  For sorting by city size
                </li>
              </ul>
            </div>
          </div>
        </article>

        {/* Reviews */}
        <article id="reviews" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">1.6 Reviews</h3>
          <p className="mb-4 text-muted-foreground">
            Reviews come from two sources: external providers (like Google) and
            site-specific reviews from users.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">
                business_review_sources (Aggregated):
              </h4>
              <p className="mb-2 text-sm text-muted-foreground">
                Summary ratings from external providers.
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <code className="rounded bg-muted px-1">provider</code> -
                  e.g., &quot;google_places&quot;
                </li>
                <li>
                  <code className="rounded bg-muted px-1">rating</code> -
                  Average rating
                </li>
                <li>
                  <code className="rounded bg-muted px-1">review_count</code> -
                  Total reviews
                </li>
              </ul>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">
                business_reviews (Individual):
              </h4>
              <p className="mb-2 text-sm text-muted-foreground">
                Individual review records from Google.
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <code className="rounded bg-muted px-1">author_name</code> -
                  Reviewer name
                </li>
                <li>
                  <code className="rounded bg-muted px-1">rating</code>,{' '}
                  <code className="rounded bg-muted px-1">text</code> - Review
                  content
                </li>
                <li>
                  <code className="rounded bg-muted px-1">time</code> - Review
                  timestamp
                </li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
