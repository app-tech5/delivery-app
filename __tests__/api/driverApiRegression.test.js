jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../config', () => ({
  config: {
    API_BASE_URL: 'http://localhost:5000/api',
    API_TIMEOUT: 5000,
    APP_NAME: 'Good Food Driver',
    DEMO_MODE: false,
    DEMO_EMAIL: 'driver@demo.com',
    DEMO_PASSWORD: 'driver123',
  },
}));

jest.mock('../../utils/storageUtils', () => ({
  clearDriverCache: jest.fn(() => Promise.resolve()),
}));

import apiClient from '../../api';

const jsonResponse = (data, ok = true, status = 200) => ({
  ok,
  status,
  json: jest.fn(() => Promise.resolve(data)),
});

describe('driver api non-demo regression', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    apiClient.token = 'token-non-demo';
    apiClient.user = { _id: 'user-1', id: 'user-1', email: 'driver@test.com' };
    apiClient.driver = { _id: 'driver-1', id: 'driver-1', status: 'offline' };
  });

  it('getDriverOrders still fetches backend in non-demo mode', async () => {
    global.fetch.mockResolvedValueOnce(
      jsonResponse([{ _id: 'order-1', id: 'order-1', status: 'preparing' }])
    );

    const data = await apiClient.getDriverOrders();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/resource/orders?driver=driver-1',
      expect.objectContaining({ headers: expect.any(Object) })
    );
    expect(data).toEqual([{ _id: 'order-1', id: 'order-1', status: 'preparing' }]);
  });

  it('updateOrder still writes to backend in non-demo mode', async () => {
    global.fetch.mockResolvedValueOnce(
      jsonResponse({ _id: 'order-1', id: 'order-1', status: 'delivered' })
    );

    const data = await apiClient.updateOrder('order-1', { status: 'delivered' });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/resource/orders/order-1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ status: 'delivered' }),
      })
    );
    expect(data.status).toBe('delivered');
  });

  it('updateDriverStatus still writes to backend in non-demo mode', async () => {
    global.fetch.mockResolvedValueOnce(
      jsonResponse({ _id: 'driver-1', id: 'driver-1', status: 'available' })
    );

    const result = await apiClient.updateDriverStatus('available', {
      latitude: 48.8566,
      longitude: 2.3522,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/resource/drivers/driver-1',
      expect.objectContaining({
        method: 'PUT',
      })
    );
    expect(result.driver.status).toBe('available');
  });
});
