jest.mock('@react-native-async-storage/async-storage', () => ({
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../utils/storageUtils', () => ({
  clearDriverCache: jest.fn(() => Promise.resolve()),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAllLocalAppDataOnLogout } from '../../utils/cacheUtils';
import { clearDriverCache } from '../../utils/storageUtils';

describe('clearAllLocalAppDataOnLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getAllKeys.mockResolvedValue([
      'driverToken',
      'driverData',
      'userData',
      'app_settings',
      'app_settings_timestamp',
      'driver_deliveries_driver-1',
      'driver_deliveries_driver-1_timestamp',
      'driver_stats_driver-1',
      'payment_methods_user-1',
      'nearby_restaurants_1.23_4.56_10',
      'cache_version',
      'delivery_demo_local_state',
      'unrelated_key',
    ]);
  });

  it('removes all app cache prefixes, demo state, version, and auth keys', async () => {
    await clearAllLocalAppDataOnLogout();

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(
      expect.arrayContaining([
        'app_settings',
        'app_settings_timestamp',
        'driver_deliveries_driver-1',
        'driver_deliveries_driver-1_timestamp',
        'driver_stats_driver-1',
        'payment_methods_user-1',
        'nearby_restaurants_1.23_4.56_10',
      ])
    );

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      'cache_version',
      'delivery_demo_local_state',
    ]);

    expect(clearDriverCache).toHaveBeenCalled();
  });
});
