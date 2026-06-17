const storage = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key) => Promise.resolve(Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null)),
  setItem: jest.fn((key, value) => {
    storage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key) => {
    delete storage[key];
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys) => {
    keys.forEach((key) => delete storage[key]);
    return Promise.resolve();
  }),
}));

jest.mock('../../utils/storageUtils', () => ({
  clearDriverCache: jest.fn(() => Promise.resolve()),
}));

const loadDemoApiClient = () => {
  jest.resetModules();
  jest.doMock('../../config', () => ({
    config: {
      API_BASE_URL: 'http://localhost:5000/api',
      API_TIMEOUT: 5000,
      APP_NAME: 'Good Food Driver',
      DEMO_MODE: true,
      DEMO_EMAIL: 'driver@demo.com',
      DEMO_PASSWORD: 'driver123',
    },
  }));
  return require('../../api').default;
};

describe('api demo mode (offline local)', () => {
  beforeEach(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: jest.fn(() => Promise.resolve({ message: 'not found' })),
    });
  });

  it('logs in demo user locally without backend call', async () => {
    const apiClient = loadDemoApiClient();

    const response = await apiClient.driverLogin('driver@demo.com', 'driver123');

    expect(response.token).toContain('demo_driver_token');
    expect(response.user.email).toBe('driver@demo.com');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/resource/drivers/byUserId',
      expect.any(Object)
    );
  });

  it('registers and logs in a demo driver locally', async () => {
    const apiClient = loadDemoApiClient();

    await apiClient.driverRegister({
      name: 'John Driver',
      email: 'john.demo@test.com',
      phone: '0612345678',
      password: 'secret123',
    });

    const loginResponse = await apiClient.driverLogin('john.demo@test.com', 'secret123');
    expect(loginResponse.user.email).toBe('john.demo@test.com');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/resource/drivers/byUserId',
      expect.any(Object)
    );
  });

  it('rejects local login when password is wrong', async () => {
    const apiClient = loadDemoApiClient();

    await expect(
      apiClient.driverLogin('driver@demo.com', 'wrong-password')
    ).rejects.toThrow('Incorrect email or password');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('creates and reads driver profile locally', async () => {
    const apiClient = loadDemoApiClient();
    await apiClient.driverLogin('driver@demo.com', 'driver123');

    const profile = await apiClient.createDriverProfile({
      licenseNumber: 'DL-12345',
      vehicleType: 'Moto',
      vehicleModel: 'Yamaha',
      licensePlate: 'AB-123-CD',
    });

    const loaded = await apiClient.getDriverProfile();

    expect(profile._id).toBeDefined();
    expect(loaded.licenseNumber).toBe('DL-12345');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('keeps write actions local and allows read from backend', async () => {
    const apiClient = loadDemoApiClient();
    await apiClient.driverLogin('driver@demo.com', 'driver123');
    const profile = await apiClient.createDriverProfile({
      licenseNumber: 'DL-999',
      vehicleType: 'Scooter',
      vehicleModel: 'Nmax',
      licensePlate: 'DE-456-FG',
    });
    expect(profile._id).toBeDefined();
    expect(global.fetch).toHaveBeenCalledTimes(1);

    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn(() =>
        Promise.resolve([
          { _id: 'order-1', id: 'order-1', status: 'preparing' },
          { _id: 'order-2', id: 'order-2', status: 'preparing' },
        ])
      ),
    });

    const orders = await apiClient.getDriverOrders();
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);

    const updated = await apiClient.updateOrder(orders[0]._id, { status: 'delivered' });
    const statusUpdated = await apiClient.updateDriverStatus('available', { latitude: 48.85, longitude: 2.35 });
    const callCountAfterWrites = global.fetch.mock.calls.length;
    const refreshedOrders = await apiClient.getDriverOrders();

    expect(updated.status).toBe('delivered');
    expect(statusUpdated.driver._id).toBe(profile._id);
    expect(callCountAfterWrites).toBe(1);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(refreshedOrders.find((item) => item._id === orders[0]._id)?.status).toBe('delivered');
  });

  it('persists local demo state across module reloads', async () => {
    const firstClient = loadDemoApiClient();
    await firstClient.driverRegister({
      name: 'Persist Driver',
      email: 'persist.demo@test.com',
      phone: '0600000000',
      password: 'persist123',
    });
    await firstClient.createDriverProfile({
      licenseNumber: 'DL-PERSIST',
      vehicleType: 'Bike',
      vehicleModel: 'Model P',
      licensePlate: 'PS-123-RT',
    });
    expect(global.fetch).not.toHaveBeenCalled();

    const secondClient = loadDemoApiClient();
    const login = await secondClient.driverLogin('persist.demo@test.com', 'persist123');
    const profile = await secondClient.getDriverProfile();

    expect(login.user.email).toBe('persist.demo@test.com');
    expect(profile.licenseNumber).toBe('DL-PERSIST');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
