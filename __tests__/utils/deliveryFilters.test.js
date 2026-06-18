import { getDeliveryFilters } from '../../utils/deliveryFilters';

describe('getDeliveryFilters', () => {
  it('defines a material-community icon for the All filter', () => {
    const filters = getDeliveryFilters();
    const allFilter = filters.find((filter) => filter.key === 'all');

    expect(allFilter).toEqual(
      expect.objectContaining({
        icon: 'format-list-bulleted',
        iconType: 'material-community',
      })
    );
  });
});
