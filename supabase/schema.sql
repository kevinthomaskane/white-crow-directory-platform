


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."claim_next_job"("p_worker_id" "text") RETURNS TABLE("id" "uuid", "job_type" "text", "payload" "jsonb", "run_id" "text", "attempt_count" smallint)
    LANGUAGE "plpgsql"
    AS $$
begin
  return query
  update public.jobs as j
  set
    status = 'processing',
    locked_at = now(),
    locked_by = p_worker_id,
    worker_id = p_worker_id,
    started_at = now(),
    attempt_count = j.attempt_count + 1,
    updated_at = now()
  where j.id = (
    select j2.id
    from public.jobs as j2
    where j2.status = 'pending'
      and j2.attempt_count < j2.max_attempts
    order by j2.created_at
    limit 1
    for update skip locked
  )
  returning
    j.id,
    j.job_type,
    j.payload,
    j.run_id,
    j.attempt_count;
end;
$$;


ALTER FUNCTION "public"."claim_next_job"("p_worker_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, '', 'admin');

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."business_categories" (
    "business_id" "uuid" NOT NULL,
    "category_id" "uuid" NOT NULL
);


ALTER TABLE "public"."business_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."business_review_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "provider" "text" NOT NULL,
    "rating" numeric(3,2),
    "review_count" integer,
    "url" "text",
    "last_synced_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."business_review_sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."business_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "source" "text" NOT NULL,
    "review_id" "text" NOT NULL,
    "author_name" "text",
    "author_url" "text",
    "author_image_url" "text",
    "rating" numeric,
    "text" "text",
    "time" timestamp with time zone,
    "raw" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."business_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."businesses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "place_id" "text" NOT NULL,
    "raw" "jsonb" NOT NULL,
    "name" "text" NOT NULL,
    "formatted_address" "text",
    "street_address" "text",
    "city" "text",
    "state" "text",
    "postal_code" "text",
    "website" "text",
    "phone" "text",
    "editorial_summary" "text",
    "description" "text",
    "main_photo_name" "text",
    "hours" "jsonb",
    "latitude" double precision,
    "longitude" double precision,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "city_id" "uuid"
);


ALTER TABLE "public"."businesses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vertical_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "state_id" "uuid" NOT NULL,
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "population" integer
);


ALTER TABLE "public"."cities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_type" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "progress" smallint DEFAULT '0'::smallint NOT NULL,
    "meta" "jsonb" DEFAULT '{}'::"jsonb",
    "error" "text",
    "worker_id" "text",
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "started_at" timestamp with time zone,
    "finished_at" timestamp with time zone,
    "attempt_count" smallint DEFAULT '0'::smallint NOT NULL,
    "max_attempts" smallint DEFAULT '3'::smallint NOT NULL,
    "run_id" "text",
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "locked_at" timestamp with time zone,
    "locked_by" "text",
    CONSTRAINT "jobs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"])))
);

ALTER TABLE ONLY "public"."jobs" REPLICA IDENTITY FULL;


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "role" "text" DEFAULT 'admin'::"text" NOT NULL,
    "display_name" "text" DEFAULT 'user'::"text" NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_businesses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "site_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "stripe_subscription_status" "text",
    "is_claimed" boolean DEFAULT false,
    "claimed_at" timestamp with time zone,
    "claimed_by" "text"
);


ALTER TABLE "public"."site_businesses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_categories" (
    "site_id" "uuid" NOT NULL,
    "category_id" "uuid" NOT NULL
);


ALTER TABLE "public"."site_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_cities" (
    "site_id" "uuid" NOT NULL,
    "city_id" "uuid" NOT NULL
);


ALTER TABLE "public"."site_cities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "state_id" "uuid" NOT NULL,
    "vertical_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "domain" "text" NOT NULL
);


ALTER TABLE "public"."sites" OWNER TO "postgres";


COMMENT ON TABLE "public"."sites" IS 'sites configured in the directory engine';



CREATE TABLE IF NOT EXISTS "public"."states" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL
);


ALTER TABLE "public"."states" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verticals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "term_category" "text" DEFAULT 'Category'::"text",
    "term_categories" "text" DEFAULT 'Categories'::"text",
    "term_business" "text" DEFAULT 'Business'::"text",
    "term_businesses" "text" DEFAULT 'Businesses'::"text",
    "term_cta" "text" DEFAULT 'Find'::"text",
    "logo_url" "text",
    "default_hero_url" "text"
);


ALTER TABLE "public"."verticals" OWNER TO "postgres";


ALTER TABLE ONLY "public"."business_categories"
    ADD CONSTRAINT "business_categories_pkey" PRIMARY KEY ("business_id", "category_id");



ALTER TABLE ONLY "public"."business_review_sources"
    ADD CONSTRAINT "business_review_sources_business_id_provider_key" UNIQUE ("business_id", "provider");



ALTER TABLE ONLY "public"."business_review_sources"
    ADD CONSTRAINT "business_review_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_reviews"
    ADD CONSTRAINT "business_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_reviews"
    ADD CONSTRAINT "business_reviews_source_review_id_key" UNIQUE ("source", "review_id");



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_place_id_key" UNIQUE ("place_id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_unique_per_vertical" UNIQUE ("vertical_id", "slug");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_name_state_id_key" UNIQUE ("name", "state_id");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_businesses"
    ADD CONSTRAINT "site_businesses_business_site_unique" UNIQUE ("business_id", "site_id");



ALTER TABLE ONLY "public"."site_businesses"
    ADD CONSTRAINT "site_businesses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_categories"
    ADD CONSTRAINT "site_categories_pkey" PRIMARY KEY ("site_id", "category_id");



ALTER TABLE ONLY "public"."site_cities"
    ADD CONSTRAINT "site_cities_pkey" PRIMARY KEY ("site_id", "city_id");



ALTER TABLE ONLY "public"."sites"
    ADD CONSTRAINT "sites_domain_key" UNIQUE ("domain");



ALTER TABLE ONLY "public"."sites"
    ADD CONSTRAINT "sites_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."sites"
    ADD CONSTRAINT "sites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."states"
    ADD CONSTRAINT "states_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."states"
    ADD CONSTRAINT "states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."verticals"
    ADD CONSTRAINT "verticals_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "public"."verticals"
    ADD CONSTRAINT "verticals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."verticals"
    ADD CONSTRAINT "verticals_slug_unique" UNIQUE ("slug");



ALTER TABLE ONLY "public"."business_categories"
    ADD CONSTRAINT "business_categories_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_categories"
    ADD CONSTRAINT "business_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_review_sources"
    ADD CONSTRAINT "business_review_sources_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_reviews"
    ADD CONSTRAINT "business_reviews_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_vertical_id_fkey" FOREIGN KEY ("vertical_id") REFERENCES "public"."verticals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_businesses"
    ADD CONSTRAINT "site_businesses_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_businesses"
    ADD CONSTRAINT "site_businesses_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_categories"
    ADD CONSTRAINT "site_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_categories"
    ADD CONSTRAINT "site_categories_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_cities"
    ADD CONSTRAINT "site_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_cities"
    ADD CONSTRAINT "site_cities_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sites"
    ADD CONSTRAINT "sites_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sites"
    ADD CONSTRAINT "sites_vertical_id_fkey" FOREIGN KEY ("vertical_id") REFERENCES "public"."verticals"("id") ON DELETE CASCADE;



CREATE POLICY "authenticated users can read profiles" ON "public"."profiles" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "authenticated users have full access" ON "public"."business_categories" USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text")) WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "authenticated users have full access" ON "public"."business_review_sources" USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text")) WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "authenticated users have full access" ON "public"."business_reviews" USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text")) WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "authenticated users have full access" ON "public"."businesses" USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text")) WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "authenticated users have full access" ON "public"."categories" USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text")) WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "authenticated users have full access" ON "public"."cities" USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text")) WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "authenticated users have full access" ON "public"."jobs" USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text")) WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "authenticated users have full access" ON "public"."site_businesses" USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text")) WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "authenticated users have full access" ON "public"."site_categories" USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text")) WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "authenticated users have full access" ON "public"."site_cities" USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text")) WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "authenticated users have full access" ON "public"."sites" USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text")) WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "authenticated users have full access" ON "public"."states" USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text")) WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "authenticated users have full access" ON "public"."verticals" USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text")) WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



ALTER TABLE "public"."business_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_review_sources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."businesses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_businesses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_cities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."verticals" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."claim_next_job"("p_worker_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."claim_next_job"("p_worker_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."claim_next_job"("p_worker_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."business_categories" TO "anon";
GRANT ALL ON TABLE "public"."business_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."business_categories" TO "service_role";



GRANT ALL ON TABLE "public"."business_review_sources" TO "anon";
GRANT ALL ON TABLE "public"."business_review_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."business_review_sources" TO "service_role";



GRANT ALL ON TABLE "public"."business_reviews" TO "anon";
GRANT ALL ON TABLE "public"."business_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."business_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."businesses" TO "anon";
GRANT ALL ON TABLE "public"."businesses" TO "authenticated";
GRANT ALL ON TABLE "public"."businesses" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."cities" TO "anon";
GRANT ALL ON TABLE "public"."cities" TO "authenticated";
GRANT ALL ON TABLE "public"."cities" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."site_businesses" TO "anon";
GRANT ALL ON TABLE "public"."site_businesses" TO "authenticated";
GRANT ALL ON TABLE "public"."site_businesses" TO "service_role";



GRANT ALL ON TABLE "public"."site_categories" TO "anon";
GRANT ALL ON TABLE "public"."site_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."site_categories" TO "service_role";



GRANT ALL ON TABLE "public"."site_cities" TO "anon";
GRANT ALL ON TABLE "public"."site_cities" TO "authenticated";
GRANT ALL ON TABLE "public"."site_cities" TO "service_role";



GRANT ALL ON TABLE "public"."sites" TO "anon";
GRANT ALL ON TABLE "public"."sites" TO "authenticated";
GRANT ALL ON TABLE "public"."sites" TO "service_role";



GRANT ALL ON TABLE "public"."states" TO "anon";
GRANT ALL ON TABLE "public"."states" TO "authenticated";
GRANT ALL ON TABLE "public"."states" TO "service_role";



GRANT ALL ON TABLE "public"."verticals" TO "anon";
GRANT ALL ON TABLE "public"."verticals" TO "authenticated";
GRANT ALL ON TABLE "public"."verticals" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































