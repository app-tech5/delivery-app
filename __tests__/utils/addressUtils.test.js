const { formatDeliveryAddress } = require('../../utils/addressUtils');

describe('formatDeliveryAddress', () => {
  it('scrubs literal undefined tokens from address strings', () => {
    expect(formatDeliveryAddress('23 undefined, 75029 Paris')).toBe('23, 75029 Paris');
  });

  it('formats address objects without undefined parts', () => {
    expect(
      formatDeliveryAddress({
        number: 12,
        street: 'Rue de Rivoli',
        postalCode: '75001',
        city: 'Paris',
      })
    ).toBe('12 Rue de Rivoli, 75001 Paris');
  });

  it('returns fallback for empty values', () => {
    expect(formatDeliveryAddress(null, 'N/A')).toBe('N/A');
    expect(formatDeliveryAddress('undefined', 'N/A')).toBe('N/A');
  });
});
