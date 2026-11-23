import 'server-only';

import { authDB } from '@/lib/auth';
import { MSPItems, MSPLookup } from '@/helpers/msp/msp-lookup';
import logger from '@/utils/logger';

export interface ResourceLinkRow {
  la_code: string;
  url: string | null;
  no_link_published: boolean;
}

// The register (resource_link, edited in the admin app) wins over the
// hard-coded list. An LA in the register without a link has none, so its old
// hard-coded link is dropped. LAs not in the register keep the hard-coded one.
export const mergeMpsLinks = (rows: ResourceLinkRow[]): MSPItems => {
  const links = { ...MSPLookup };
  rows.forEach((row) => {
    if (row.url && !row.no_link_published) {
      links[row.la_code] = { url: row.url };
    } else {
      delete links[row.la_code];
    }
  });
  return links;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { links: MSPItems; fetchedAt: number } | null = null;

export const getMpsLinks = async (): Promise<MSPItems> => {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.links;
  }
  try {
    // authDB is Kysely<any>, so rows come back untyped
    const rows = (await authDB
      .selectFrom('resource_link')
      .select(['la_code', 'url', 'no_link_published'])
      .where('resource_type', '=', 'mps')
      .execute()) as ResourceLinkRow[];
    cache = { links: mergeMpsLinks(rows), fetchedAt: Date.now() };
    return cache.links;
  } catch (error) {
    logger.error('Could not read MPS links from the register', {
      error: (error as Error).message,
    });
    // The last good read is closer to the register than the hard-coded list
    return cache?.links ?? MSPLookup;
  }
};
