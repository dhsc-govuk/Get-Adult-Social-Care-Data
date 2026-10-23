import fs from 'fs';
import path from 'path';
import { http, HttpResponse } from 'msw';
import { API_SUFFIX } from '@/data/dataAPI';

// Metric data that differs by metric, location and date but is the same on
// every run, for the screenshot tests (served by scripts/mock-data-api.ts).
// Kept apart from the default handlers, whose identical values the route
// tests rely on.

const api_root = process.env.DATA_API_ROOT + API_SUFFIX;

interface MetricDefinition {
  frequency: string;
  min: number;
  max: number;
}

const DEFAULT_DEFINITION: MetricDefinition = {
  frequency: 'Yearly',
  min: 0,
  max: 1000,
};

// The data generator's per-metric frequencies and value ranges
const METRIC_DATA_CSV = path.join(
  process.cwd(),
  '../gascd_api/DataGeneration/data/metric_data.csv'
);

const loadMetricDefinitions = (): Record<string, MetricDefinition> => {
  const definitions: Record<string, MetricDefinition> = {};
  if (!fs.existsSync(METRIC_DATA_CSV)) return definitions;
  for (const line of fs.readFileSync(METRIC_DATA_CSV, 'utf8').split('\n')) {
    const [, metric, frequency, , min, max] = line.trim().split(',');
    if (!metric) continue;
    definitions[metric] = {
      frequency,
      min: parseFloat(min),
      max: parseFloat(max),
    };
  }
  return definitions;
};

const metricDefinitions = loadMetricDefinitions();

const definitionFor = (metricCode: string): MetricDefinition =>
  metricDefinitions[metricCode] ?? DEFAULT_DEFINITION;

// transformSeriesData only handles these three frequencies
const seriesFrequency = (frequency: string) =>
  frequency === 'Daily' || frequency === '5 years' ? frequency : 'Yearly';

// FNV-1a: a stable 0-1 value for a key
const fraction = (key: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) / 0xffffffff;
};

const SERIES_LENGTH: Record<string, number> = {
  Daily: 31,
  Yearly: 5,
  '5 years': 3,
};

const seriesDates = (frequency: string, length: number) => {
  if (frequency === 'Daily') {
    return {
      start: '2026-01-01',
      end: `2026-01-${String(length).padStart(2, '0')}`,
    };
  }
  const step = frequency === '5 years' ? 5 : 1;
  const end = frequency === '5 years' ? 2021 : 2025;
  return { start: String(end - step * (length - 1)), end: String(end) };
};

const seriesValues = (
  metricCode: string,
  key: string,
  length: number
): number[] => {
  const { min, max } = definitionFor(metricCode);
  const range = max - min;
  const base = min + range * (0.2 + 0.6 * fraction(`${metricCode}|${key}`));
  return Array.from({ length }, (_, i) => {
    const drift = 1 + 0.03 * (i - length + 1);
    const jitter = 0.96 + 0.08 * fraction(`${metricCode}|${key}|${i}`);
    const value = Math.min(max, Math.max(min, base * drift * jitter));
    return range >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  });
};

const buildSeries = (metricCode: string, key: string) => {
  const frequency = seriesFrequency(definitionFor(metricCode).frequency);
  const length = SERIES_LENGTH[frequency];
  const { start, end } = seriesDates(frequency, length);
  return {
    frequency,
    start,
    end,
    values: seriesValues(metricCode, key, length),
  };
};

const PEER_COUNT = 15;

export const variedHandlers = [
  http.post<{ metric_id: string }>(
    api_root + '/metrics/:metric_id/data',
    async ({ request, params }) => {
      const metric_id = params.metric_id;
      const time_series =
        new URL(request.url).searchParams.get('time_series') === 'true';
      const locations = (await request.json()) as any[];

      return HttpResponse.json(
        locations.map((location) => {
          const series = buildSeries(metric_id, location.location_code);
          return {
            metric_code: metric_id,
            location_code: location.location_code,
            location_type: location.location_type,
            series_frequency: series.frequency,
            series_end_date: series.end,
            ...(time_series
              ? {
                  series_start_date: series.start,
                  values: series.values.map(String),
                }
              : { values: [String(series.values[series.values.length - 1])] }),
          };
        })
      );
    }
  ),

  http.get(
    api_root + '/metric_locations/local_authority_peers/:la_code',
    ({ request, params }) => {
      const metric_code =
        new URL(request.url).searchParams.get('metric_code') ?? '';
      const latest = (key: string) => {
        const { values } = buildSeries(metric_code, key);
        return values[values.length - 1];
      };
      const local_authority_peers = Array.from(
        { length: PEER_COUNT },
        (_, i) => ({
          code: `peer${i + 1}`,
          display_name: `Peer LA ${i + 1}`,
          peer_ranking: i + 1,
          metric_value: latest(`${params.la_code}|peer${i + 1}`),
        })
      );
      const average_peer_group =
        local_authority_peers.reduce(
          (sum, peer) => sum + peer.metric_value,
          0
        ) / PEER_COUNT;
      return HttpResponse.json({
        local_authority_peers,
        average_peer_group,
        national_average: latest('National'),
      });
    }
  ),

  http.post<{ la_code: string }>(
    api_root + '/metric_locations/local_authority_peers/:la_code/series',
    async ({ request, params }) => {
      const metric_codes = (await request.json()) as string[];
      return HttpResponse.json(
        metric_codes.map((metric_code) => {
          const series = buildSeries(metric_code, `${params.la_code}|peers`);
          return {
            metric_code,
            peer_count: PEER_COUNT,
            series_start_date: series.start,
            series_end_date: series.end,
            series_frequency: series.frequency,
            values: series.values,
          };
        })
      );
    }
  ),
];
