export function DocsDataModelSection() {
  return (
    <section id="data-model" className="scroll-mt-8">
      <h2 className="mb-6 border-b pb-2 text-2xl font-bold">2. Data Model</h2>

      <div className="space-y-8">
        {/* Join Tables */}
        <article id="join-tables" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">2.1 Join Tables</h3>
          <p className="mb-4 text-muted-foreground">
            The platform uses several join tables to create many-to-many
            relationships:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-medium">Table</th>
                  <th className="px-4 py-2 text-left font-medium">Purpose</th>
                  <th className="px-4 py-2 text-left font-medium">Keys</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="px-4 py-2">
                    <code className="rounded bg-muted px-1">
                      business_categories
                    </code>
                  </td>
                  <td className="px-4 py-2">Links businesses to categories</td>
                  <td className="px-4 py-2">business_id, category_id</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">
                    <code className="rounded bg-muted px-1">site_categories</code>
                  </td>
                  <td className="px-4 py-2">
                    Which categories appear on a site
                  </td>
                  <td className="px-4 py-2">site_id, category_id</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">
                    <code className="rounded bg-muted px-1">site_cities</code>
                  </td>
                  <td className="px-4 py-2">Which cities appear on a site</td>
                  <td className="px-4 py-2">site_id, city_id</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">
                    <code className="rounded bg-muted px-1">site_businesses</code>
                  </td>
                  <td className="px-4 py-2">
                    Which businesses appear on a site (with site-specific data)
                  </td>
                  <td className="px-4 py-2">site_id, business_id</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        {/* Site Businesses */}
        <article id="site-businesses" className="scroll-mt-8">
          <h3 className="mb-3 text-xl font-semibold">2.2 Site Businesses</h3>
          <p className="mb-4 text-muted-foreground">
            The <code className="rounded bg-muted px-1">site_businesses</code>{' '}
            table is more than a simple join table. It stores site-specific data
            about a business, including claiming and subscription information.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">Key Fields:</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>
                <code className="rounded bg-muted px-1">is_claimed</code>,{' '}
                <code className="rounded bg-muted px-1">claimed_by</code>,{' '}
                <code className="rounded bg-muted px-1">claimed_at</code> -
                Business owner claiming
              </li>
              <li>
                <code className="rounded bg-muted px-1">verification_status</code>
                ,{' '}
                <code className="rounded bg-muted px-1">verification_email</code>{' '}
                - Email verification for claims
              </li>
              <li>
                <code className="rounded bg-muted px-1">plan</code> -
                Subscription tier (null, &quot;free&quot;, &quot;premium&quot;)
              </li>
              <li>
                <code className="rounded bg-muted px-1">stripe_customer_id</code>,{' '}
                <code className="rounded bg-muted px-1">
                  stripe_subscription_id
                </code>{' '}
                - Payment tracking
              </li>
              <li>
                <code className="rounded bg-muted px-1">description</code>,{' '}
                <code className="rounded bg-muted px-1">main_photo</code> -
                Site-specific overrides
              </li>
            </ul>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            This allows the same business to appear on multiple sites with
            different descriptions, photos, and subscription statuses on each.
          </p>
        </article>
      </div>
    </section>
  );
}
