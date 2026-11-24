import 'server-only';

import { authDB } from '@/lib/auth';
import { MSPItems } from '@/helpers/msp/types';
import logger from '@/utils/logger';

export interface ResourceLinkRow {
  la_code: string;
  url: string | null;
  no_link_published: boolean;
}

// The register (resource_link, edited in the admin app) is the only source of
// links. An LA without a published link in the register has none.
export const toMpsLinks = (rows: ResourceLinkRow[]): MSPItems => {
  const links: MSPItems = {};
  rows.forEach((row) => {
    if (row.url && !row.no_link_published) {
      links[row.la_code] = { url: row.url };
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
    cache = { links: toMpsLinks(rows), fetchedAt: Date.now() };
    return cache.links;
  } catch (error) {
    logger.error('Could not read MPS links from the register', {
      error: (error as Error).message,
    });
    // The last good read if there is one, otherwise no links
    return cache?.links ?? {};
  }
};
