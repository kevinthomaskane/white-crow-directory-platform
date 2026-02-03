export function DocsTableOfContents() {
  return (
    <nav className="rounded-lg border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Table of Contents</h2>
      <ul className="space-y-2 text-sm">
        <li>
          <a href="#core-concepts" className="text-primary hover:underline">
            1. Core Concepts
          </a>
          <ul className="ml-4 mt-1 space-y-1 text-muted-foreground">
            <li>
              <a href="#verticals" className="hover:text-primary">
                1.1 Verticals
              </a>
            </li>
            <li>
              <a href="#categories" className="hover:text-primary">
                1.2 Categories
              </a>
            </li>
            <li>
              <a href="#businesses" className="hover:text-primary">
                1.3 Businesses
              </a>
            </li>
            <li>
              <a href="#sites" className="hover:text-primary">
                1.4 Sites
              </a>
            </li>
            <li>
              <a href="#geography" className="hover:text-primary">
                1.5 Geography (States & Cities)
              </a>
            </li>
            <li>
              <a href="#reviews" className="hover:text-primary">
                1.6 Reviews
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="#data-model" className="text-primary hover:underline">
            2. Data Model
          </a>
          <ul className="ml-4 mt-1 space-y-1 text-muted-foreground">
            <li>
              <a href="#join-tables" className="hover:text-primary">
                2.1 Join Tables
              </a>
            </li>
            <li>
              <a href="#site-businesses" className="hover:text-primary">
                2.2 Site Businesses
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="#creating-a-site" className="text-primary hover:underline">
            3. Creating a New Site
          </a>
          <ul className="ml-4 mt-1 space-y-1 text-muted-foreground">
            <li>
              <a href="#step-1-vertical" className="hover:text-primary">
                3.1 Define a Vertical
              </a>
            </li>
            <li>
              <a href="#step-2-categories" className="hover:text-primary">
                3.2 Create Categories
              </a>
            </li>
            <li>
              <a href="#step-3-site-form" className="hover:text-primary">
                3.3 Create the Site
              </a>
            </li>
            <li>
              <a href="#step-4-job-processing" className="hover:text-primary">
                3.4 Job Processing
              </a>
            </li>
            <li>
              <a href="#step-5-search-sync" className="hover:text-primary">
                3.5 Search Index Sync
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="#managing-a-site" className="text-primary hover:underline">
            4. Managing a Site
          </a>
          <ul className="ml-4 mt-1 space-y-1 text-muted-foreground">
            <li>
              <a href="#site-overview" className="hover:text-primary">
                4.1 Site Overview
              </a>
            </li>
            <li>
              <a href="#site-categories-cities" className="hover:text-primary">
                4.2 Categories & Cities
              </a>
            </li>
            <li>
              <a href="#site-search-index" className="hover:text-primary">
                4.3 Search Index
              </a>
            </li>
            <li>
              <a href="#site-business-data" className="hover:text-primary">
                4.4 Business Data
              </a>
            </li>
            <li>
              <a href="#site-assets" className="hover:text-primary">
                4.5 Site Assets
              </a>
            </li>
            <li>
              <a href="#site-submissions" className="hover:text-primary">
                4.6 Business Submissions
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="#tech-stack" className="text-primary hover:underline">
            5. Tech Stack & Architecture
          </a>
          <ul className="ml-4 mt-1 space-y-1 text-muted-foreground">
            <li>
              <a href="#stack-overview" className="hover:text-primary">
                5.1 Tech Stack Overview
              </a>
            </li>
            <li>
              <a href="#project-structure" className="hover:text-primary">
                5.2 Project Structure
              </a>
            </li>
            <li>
              <a href="#deployment" className="hover:text-primary">
                5.3 Deployment
              </a>
            </li>
            <li>
              <a href="#data-flow" className="hover:text-primary">
                5.4 Data Flow
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}
