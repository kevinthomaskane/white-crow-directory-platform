# Directory Engine

Next.js frontend for the White Crow Directory Platform.

## Vertical Assets

Verticals can have default assets (hero image, logo, favicon) that are used across all sites in that vertical. Assets are stored in Supabase Storage with unique filenames and their URLs are persisted in the database.

### Storage Structure

Each vertical has its own public bucket in Supabase Storage named after the vertical slug (e.g., `lawyers`). Assets are uploaded with unique timestamped filenames:

```
{vertical-slug}/
  hero-1704067200000
  logo-1704067200000
  favicon-1704067200000
```

### Database Fields

The `verticals` table stores the public URLs for each asset:

| Field              | Description                     |
| ------------------ | ------------------------------- |
| `default_hero_url` | Hero image URL for the vertical |
| `logo_url`         | Logo URL (TODO)                 |
| `favicon_url`      | Favicon URL (TODO)              |

### Upload Flow

1. Admin selects a file in the vertical edit page
2. `getVerticalAssetUploadUrl()` creates the bucket (if needed) and returns a signed upload URL
3. Frontend uploads directly to Supabase Storage via PUT request
4. `saveVerticalHeroUrl()` (or equivalent) saves the public URL to the database
5. Sites read the URL from the database via `SiteConfig`

### Adding a New Asset Type

To add a new vertical asset (e.g., `logo`):

1. **Add the asset type** to `lib/types.ts`:

   ```ts
   export type VerticalAssetType = 'hero' | 'logo' | 'favicon';
   ```

2. **Add database field** to `verticals` table (if not exists):

   ```sql
   ALTER TABLE verticals ADD COLUMN logo_url TEXT;
   ```

3. **Create a save action** in `actions/upload-vertical-asset.ts`:

   ```ts
   export async function saveVerticalLogoUrl(
     verticalId: string,
     logoUrl: string
   ): Promise<ActionsResponse<null>> {
     // Same pattern as saveVerticalHeroUrl
   }
   ```

4. **Add to SiteConfig** in `lib/routing/types.ts`:

   ```ts
   export interface SiteConfig {
     // ...existing fields
     logoUrl: string | null;
   }
   ```

5. **Update the query** in `lib/routing/data.ts` to fetch the new field

6. **Add upload UI** in `components/admin/vertical-assets-form.tsx` using the existing `AssetUpload` component pattern

### Why Unique Filenames?

Using timestamped filenames (e.g., `hero-1704067200000`) instead of fixed names (e.g., `hero.jpg`):

- **No cache invalidation needed** - new upload = new URL = no stale cache
- **Rollback capability** - old files remain in storage
- **CDN-friendly** - immutable URLs cache indefinitely

### TESTING Login

Lett Lawfirm
https://www.lettlawfirm.com/
business id: 4d11f62e-bf9c-4afe-a86d-d4c76a3acf12

10xDev
site_business_id: 05016ed1-2bbe-4f99-a748-f98cf3b8999a
