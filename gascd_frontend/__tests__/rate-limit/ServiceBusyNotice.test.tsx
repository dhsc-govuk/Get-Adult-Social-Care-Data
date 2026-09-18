import { render, screen, fireEvent, act } from '@testing-library/react';
import ServiceBusyNotice from '@/components/common/ServiceBusyNotice';
import { serviceFetch } from '@/lib/service-fetch';

afterEach(() => vi.unstubAllGlobals());
it('announces throttling without retrying or replacing existing page data', async () => {
  render(
    <>
      <ServiceBusyNotice />
      <p>Existing chart data</p>
    </>
  );
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(null, { status: 429, headers: { 'Retry-After': '8' } })
      )
  );
  await act(async () => {
    await serviceFetch('/api/get_metric_data');
  });
  expect(screen.getByRole('alert')).toHaveTextContent('wait 8 seconds');
  expect(screen.getByText('Existing chart data')).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
