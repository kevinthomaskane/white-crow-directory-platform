export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="mt-1 text-muted-foreground">
          Manage your directory sites and listings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Sites"
          description="Manage directory sites and their configurations"
          href="/admin/sites"
        />
        <DashboardCard
          title="Listings"
          description="Add, edit, and manage business listings"
          href="/admin/listings"
        />
        <DashboardCard
          title="Categories"
          description="Organize listings with categories and tags"
          href="/admin/categories"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent hover:bg-accent"
    >
      <h3 className="font-medium text-card-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </a>
  );
}
