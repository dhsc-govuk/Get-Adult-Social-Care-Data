import { toggleLocation } from '../../app/(protected)/manage-users/LocationCheckboxes';

describe('toggleLocation', () => {
  it('clears other boxes when all locations is ticked', () => {
    expect(toggleLocation(['L1', 'L2'], 'all', true)).toEqual(['all']);
  });

  it('clears all locations when a single location is ticked', () => {
    expect(toggleLocation(['all'], 'L1', true)).toEqual(['L1']);
  });

  it('unticks a location', () => {
    expect(toggleLocation(['L1', 'L2'], 'L1', false)).toEqual(['L2']);
  });
});
