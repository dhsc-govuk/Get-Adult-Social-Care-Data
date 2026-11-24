import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockSession, mockSessionUnregistered } from '@/test-utils/test-utils';
import { auth } from '@/lib/auth';
import type { ResourceLinkRow } from '@/lib/mpsLinksServer';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));
vi.mock('server-only', () => ({
  default: vi.fn(),
}));

const execute = vi.fn();
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
  authDB: {
    selectFrom: () => ({
      select: () => ({
        where: () => ({ execute }),
      }),
    }),
  },
}));
const mockGetSession = vi.mocked(auth.api.getSession);

const rows: ResourceLinkRow[] = [
  {
    la_code: 'E09000003',
    url: 'https://www.barnet.gov.uk/register',
    no_link_published: false,
  },
  { la_code: 'E09000006', url: null, no_link_published: true },
];
const merged = {
  E09000003: { url: 'https://www.barnet.gov.uk/register' },
};

// A fresh module each time, so the cache starts empty
const load = async () => {
  vi.resetModules();
  return import('@/lib/mpsLinksServer');
};

describe('getMpsLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('uses the register URL when the row has one', async () => {
    execute.mockResolvedValue(rows);
    const { getMpsLinks } = await load();
    expect((await getMpsLinks()).E09000003).toEqual(merged.E09000003);
  });

  it('has no link when no link is published', async () => {
    execute.mockResolvedValue(rows);
    const { getMpsLinks } = await load();
    expect((await getMpsLinks()).E09000006).toBeUndefined();
  });

  it('has no link for LAs with no row', async () => {
    execute.mockResolvedValue(rows);
    const { getMpsLinks } = await load();
    expect((await getMpsLinks()).testla1).toBeUndefined();
  });

  it('has no links when the read fails', async () => {
    execute.mockRejectedValue(new Error('Invalid object name'));
    const { getMpsLinks } = await load();
    expect(await getMpsLinks()).toEqual({});
  });

  it('reads the register again only after five minutes', async () => {
    vi.useFakeTimers();
    execute.mockResolvedValue(rows);
    const { getMpsLinks } = await load();
    await getMpsLinks();
    vi.advanceTimersByTime(4 * 60 * 1000);
    await getMpsLinks();
    expect(execute).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2 * 60 * 1000);
    execute.mockRejectedValue(new Error('Timeout'));
    expect(await getMpsLinks()).toEqual(merged);
    expect(execute).toHaveBeenCalledTimes(2);
  });
});

describe('GET /api/get_mps_links', () => {
  const get = async () => {
    vi.resetModules();
    const { GET } = await import('../../app/api/get_mps_links/route');
    return GET();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    execute.mockResolvedValue(rows);
  });

  it('returns the links to a signed-in user', async () => {
    mockGetSession.mockReturnValue(mockSession);
    const response = await get();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(merged);
  });

  it('refuses an unregistered user', async () => {
    mockGetSession.mockReturnValue(mockSessionUnregistered);
    const response = await get();
    expect(response.status).toBe(401);
    expect(execute).not.toHaveBeenCalled();
  });
});
