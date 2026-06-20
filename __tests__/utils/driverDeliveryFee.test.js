import {
  getDriverDeliveryEarnings,
  clearDeliverySettingsCache,
  preloadDeliverySettingsForOrders,
} from '../../utils/driverDeliveryFee';
import { calculateDriverDeliveryFeeFromSetting } from '../../utils/deliverySetting';

jest.mock('../../api', () => ({
  __esModule: true,
  default: {
    getRestaurantDeliverySettings: jest.fn(),
  },
}));

const apiClient = require('../../api').default;

const dynamicSetting = {
  isDeliveryEnabled: true,
  deliveryFeeType: 'DYNAMIC',
  fixedDeliveryFee: 3.36,
  dynamicDeliveryFee: {
    baseFee: 3.76,
    perKmFee: 1.05,
    minFee: 2.06,
    maxFee: 17.8,
  },
};

describe('calculateDriverDeliveryFeeFromSetting', () => {
  it('does not apply client minFee or maxFee caps', () => {
    expect(calculateDriverDeliveryFeeFromSetting(dynamicSetting, 13.6)).toBe(18.04);
    expect(calculateDriverDeliveryFeeFromSetting(dynamicSetting, 100)).toBe(108.76);
  });

  it('ignores FREE delivery type promo for driver earnings', () => {
    expect(
      calculateDriverDeliveryFeeFromSetting(
        { ...dynamicSetting, deliveryFeeType: 'FREE' },
        10,
      )
    ).toBe(14.26);
  });
});

describe('getDriverDeliveryEarnings', () => {
  beforeEach(() => {
    clearDeliverySettingsCache();
    apiClient.getRestaurantDeliverySettings.mockReset();
  });

  it('calculates dynamic fee from user location and restaurant coords', async () => {
    apiClient.getRestaurantDeliverySettings.mockResolvedValue(dynamicSetting);

    const order = {
      _id: '697a2d966e8b65e2818de674',
      restaurant: { _id: 'resto1', latitude: '48.8738', longitude: '2.2950' },
      user: {
        name: 'Test',
        location: { latitude: 48.8656, longitude: 2.3212 },
      },
      delivery: { type: 'delivery', deliveryFee: 4.74 },
    };

    await preloadDeliverySettingsForOrders([order]);

    expect(getDriverDeliveryEarnings(order)).toBe(5.86);
  });

  it('returns 0 for dynamic orders without coords', async () => {
    apiClient.getRestaurantDeliverySettings.mockResolvedValue(dynamicSetting);

    const order = {
      _id: '697a2c177323de26348de666',
      restaurant: { _id: 'resto1', latitude: '48.87', longitude: '2.35' },
      user: { name: 'Test' },
      delivery: { type: 'delivery', deliveryFee: 2.5 },
    };

    await preloadDeliverySettingsForOrders([order]);

    expect(getDriverDeliveryEarnings(order)).toBe(0);
  });

  it('uses fixed fee for FIXED delivery type regardless of stored deliveryFee', async () => {
    apiClient.getRestaurantDeliverySettings.mockResolvedValue({
      isDeliveryEnabled: true,
      deliveryFeeType: 'FIXED',
      fixedDeliveryFee: 3.5,
    });

    const order = {
      _id: 'order-free',
      restaurant: { _id: 'resto2' },
      delivery: { type: 'delivery', deliveryFee: 0 },
    };

    await preloadDeliverySettingsForOrders([order]);

    expect(getDriverDeliveryEarnings(order)).toBe(3.5);
  });
});
