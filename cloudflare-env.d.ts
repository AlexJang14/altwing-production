declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ANALYTICS_ADMIN_EMAIL?: string;
    ANALYTICS_ADDITIONAL_ADMIN_EMAILS?: string;
    ANALYTICS_INGEST_SECRET?: string;
    ANALYTICS_ALLOWED_ORIGINS?: string;
  }
}
