import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

/**
 * Lunara's pages are prerendered (setRequestLocale + generateStaticParams)
 * and nothing revalidates, so the read-only Workers Static Assets cache
 * serves them with no KV/R2/Queue (docs/4-architecture.md §2.3). If ISR or
 * revalidation is ever introduced, this must move to an R2 incremental
 * cache plus a queue.
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
