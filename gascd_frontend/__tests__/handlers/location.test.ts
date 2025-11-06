import { NextResponse } from 'next/server';
import { GET as GetLocalAuthority } from '../../app/api/get_local_authority/route';
import { GET as GetCareProviderLocation } from '../../app/api/get_care_provider/route';

vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: vi.fn((payload, opts?) => ({ payload, status: opts?.status ?? 200 })),
        },
    };
});

describe('get_local_authority', () => {

    const nextResponseMock = NextResponse as { json: ReturnType<typeof vi.fn> & { mock?: any } };
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        (global.fetch as vi.Mock).mockClear?.();
        (nextResponseMock.json as vi.Mock).mockClear?.();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });
    
    it('fetches and returns local authority successfully', async () => {
        const query = 'E08000024';
        const mockLocalAuthority: {} = {
          id: 'E08000024',
          display_name: 'Sunderland',
          geo_data: {
            latitude: 54.880445953877775,
            longitude: -1.4519587820223236,
            bbox: [
              [-1.5688915330791782, 54.944529934401686],
              [-1.5688915330791782, 54.79905189140416],
              [-1.346135332338452, 54.944529934401686],
              [-1.346135332338452, 54.79905189140416],
            ]
          },
          region_id: 'E12000001',
        };

        (global.fetch as vi.Mock).mockResolvedValue({
            json: async () => mockLocalAuthority,
        });

        const req = { url: `http://localhost/api/get_local_authority?la_code=${query}` } as NextRequest;

        const result = await GetLocalAuthority(req);

        expect(global.fetch).toHaveBeenCalledWith(
            `http://test.api.gascd.gov.uk/metric_location/local_authorities/?code=${query}`
        );

        expect(nextResponseMock.json).toHaveBeenCalledWith(mockLocalAuthority, { status: 200 });

        expect(result).toEqual({ payload: mockLocalAuthority, status: 200 });
    });
});

describe('get_care_provider_location', () => {

    const nextResponseMock = NextResponse as { json: ReturnType<typeof vi.fn> & { mock?: any } };
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        (global.fetch as vi.Mock).mockClear?.();
        (nextResponseMock.json as vi.Mock).mockClear?.();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });
    
    it('fetches and returns care provider location successfully', async () => {
        const query = 'testcpl1';
        const mockCareProviderLocation: {} = {
            id: 'testcpl1',
            display_name: 'Mock Care Provider Location',
            geo_data: {
            latitude: 54.8798077426683,
            longitude: -1.4036740441143998,
            },
            provider_id: 'testcp2',
            provider_name: 'Mock Care Provider',
            nominated_individual: 'John Doe',
            local_authority_id: 'E08000024',
        };

        (global.fetch as vi.Mock).mockResolvedValue({
            json: async () => mockCareProviderLocation,
        });

        const req = { url: `http://localhost/api/get_care_provider_location?cp_code=${query}` } as NextRequest;

        const result = await GetCareProviderLocation(req);

        expect(global.fetch).toHaveBeenCalledWith(
            `http://test.api.gascd.gov.uk/metric_location/cp_locations/?code=${query}`
        );

        expect(nextResponseMock.json).toHaveBeenCalledWith(mockCareProviderLocation, { status: 200 });

        expect(result).toEqual({ payload: mockCareProviderLocation, status: 200 });
    });
});

