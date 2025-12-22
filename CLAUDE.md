# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

White Crow Directory Platform is a multi-tenant business directory platform built with a monorepo architecture. It aggregates business data from Google Places API and stores it in Supabase.

## Commands

### Development
```bash
# Install dependencies (uses pnpm workspaces)
pnpm install

# Run Next.js frontend (directory-engine)
cd apps/directory-engine && pnpm dev

# Build and run worker
cd apps/worker && pnpm build && pnpm start

# Build shared package (required before other apps can use it)
cd packages/shared && pnpm build
```

### Supabase
```bash
# Generate TypeScript types from Supabase schema
pnpm supabase:types

# Login to Supabase CLI (required before generating types)
pnpm supabase:login
```

## Architecture

### Monorepo Structure

- **apps/directory-engine**: Next.js 16 frontend with App Router. Handles admin UI and public directory sites.
- **apps/worker**: Background job processor for Google Places API data ingestion. Built with tsup.
- **packages/shared**: Shared code including Supabase client, database types, and job schemas.

### Key Patterns

**Supabase Client Usage**:
- `packages/shared/src/supabase/service-role.ts` - Service role client for server-side operations
- `apps/directory-engine/lib/supabase/server.ts` - Server-side client for Next.js (uses cookies)
- `apps/directory-engine/lib/supabase/client.ts` - Browser client for client components

**Job System**:
- Jobs are stored in `jobs` table with `job_type`, `payload`, `meta`, `status`, and `progress` fields
- Worker claims jobs via `claim_next_job` RPC function
- Job payloads are validated with Zod schemas in `packages/shared/src/jobs/`
- Processors live in `apps/worker/src/processors/`

**Database Types**:
- Auto-generated from Supabase in `packages/shared/src/supabase/database.ts`
- Exported via `@white-crow/shared` package for type-safe queries

**Database Schema**:
- Auto-generated from Supabase in `supabase/schema.sql`

### Data Model

Core entities: `businesses`, `categories`, `verticals`, `business_reviews`, `business_review_sources`
- Businesses link to categories via `business_categories` join table
- Categories belong to verticals (e.g., "Lawyers" vertical has "Personal Injury", "DUI" categories)
- Reviews are stored with source tracking (`google_places`)

### Environment Variables

**directory-engine**:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**worker**:
- `WORKER_ID`, `GOOGLE_PLACES_API_KEY`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
