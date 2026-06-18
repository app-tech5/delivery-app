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

const { config } = jest.requireActual('../../config');

const apiUrl = (path) => `${config.API_BASE_URL}${path}`;

const loadDemoApiClient = () => {
  jest.resetModules();
  jest.doMock('../../config', () => {
    const actual = jest.requireActual('../../config');
    return {
      ...actual,
      config: { ...actual.config, DEMO_MODE: true },
    };
  });
  return require('../../api').default;
};

const jsonResponse = (data, ok = true, status = 200) => ({
  ok,
  status,
  json: jest.fn(() => Promise.resolve(data)),
});

const DB_DEMO_USER = {
  _id: 'user-db-demo',
  id: 'user-db-demo',
  email: config.DEMO_EMAIL,
  name: 'Demo Driver',
  role: 'delivery',
};

const DB_DEMO_DRIVER = {
  _id: 'driver-db-demo',
  id: 'driver-db-demo',
  userId: 'user-db-demo',
  licenseNumber: 'DL-DB-01',
  status: 'offline',
  isApproved: true,
  vehicle: { type: 'Moto', model: 'Yamaha', licensePlate: 'DB-001' },
};

const mockBuiltinDemoLogin = () => {
  global.fetch
    .mockResolvedValueOnce(jsonResponse({ token: 'jwt-from-db', user: DB_DEMO_USER }))
    .mockResolvedValueOnce(jsonResponse(DB_DEMO_DRIVER));
};

describe('api demo mode (reads backend, writes local)', () => {
  beforeEach(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ message: 'not found' }, false, 404));
  });

  it('logs in the builtin demo user against the backend and loads the driver profile', async () => {
    const apiClient = loadDemoApiClient();
    mockBuiltinDemoLogin();

    const response = await apiClient.driverLogin(config.DEMO_EMAIL, config.DEMO_PASSWORD);

    expect(response.token).toBe('jwt-from-db');
    expect(response.user.email).toBe(config.DEMO_EMAIL);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      apiUrl('/auth/delivery-login'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      apiUrl('/resource/drivers/byUserId'),
      expect.any(Object)
    );
    expect(apiClient.driver?.licenseNumber).toBe('DL-DB-01');
    expect(apiClient.driver?.isApproved).toBe(true);
  });

  it('registers and logs in a locally tracked demo driver without backend auth', async () => {
    const apiClient = loadDemoApiClient();

    await apiClient.driverRegister({
      name: 'John Driver',
      email: 'john.demo@test.com',
      phone: '0612345678',
      password: 'secret123',
    });

    const loginResponse = await apiClient.driverLogin('john.demo@test.com', 'secret123');
    expect(loginResponse.user.email).toBe('john.demo@test.com');
    expect(apiClient.driver).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      apiUrl('/resource/drivers/byUserId'),
      expect.any(Object)
    );
  });

  it('rejects local login when password is wrong for a locally tracked driver', async () => {
    const apiClient = loadDemoApiClient();

    await apiClient.driverRegister({
      name: 'John Driver',
      email: 'john.demo@test.com',
      phone: '0612345678',
      password: 'secret123',
    });

    await expect(
      apiClient.driverLogin('john.demo@test.com', 'wrong-password')
    ).rejects.toThrow('Incorrect email or password');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('creates a driver profile locally and overlays it on backend reads', async () => {
    const apiClient = loadDemoApiClient();
    mockBuiltinDemoLogin();
    await apiClient.driverLogin(config.DEMO_EMAIL, config.DEMO_PASSWORD);

    const profile = await apiClient.createDriverProfile({
      licenseNumber: 'DL-12345',
      vehicleType: 'Moto',
      vehicleModel: 'Yamaha',
      licensePlate: 'AB-123-CD',
    });

    global.fetch.mockResolvedValueOnce(jsonResponse(DB_DEMO_DRIVER));
    const loaded = await apiClient.getDriverProfile();

    expect(profile._id).toBeDefined();
    expect(profile.licenseNumber).toBe('DL-12345');
    expect(loaded.licenseNumber).toBe('DL-12345');
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('keeps write actions local and allows read from backend', async () => {
    const apiClient = loadDemoApiClient();
    mockBuiltinDemoLogin();
    await apiClient.driverLogin(config.DEMO_EMAIL, config.DEMO_PASSWORD);
    const profile = apiClient.driver;

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

    const callCountBeforeWrites = global.fetch.mock.calls.length;
    const updated = await apiClient.updateOrder(orders[0]._id, { status: 'delivered' });
    const statusUpdated = await apiClient.updateDriverStatus('available', { latitude: 48.85, longitude: 2.35 });
    const callCountAfterWrites = global.fetch.mock.calls.length;
    const refreshedOrders = await apiClient.getDriverOrders();

    expect(updated.status).toBe('delivered');
    expect(statusUpdated.driver._id).toBe(profile._id);
    expect(callCountAfterWrites - callCountBeforeWrites).toBe(0);
    expect(global.fetch.mock.calls.length).toBe(callCountAfterWrites + 1);
    expect(refreshedOrders.find((item) => item._id === orders[0]._id)?.status).toBe('delivered');
  });

  it('keeps updateDriverLocation local without backend call', async () => {
    const apiClient = loadDemoApiClient();
    mockBuiltinDemoLogin();
    await apiClient.driverLogin(config.DEMO_EMAIL, config.DEMO_PASSWORD);

    const fetchCountBefore = global.fetch.mock.calls.length;
    const coords = { latitude: 4.0982637, longitude: 9.6576275 };

    const updatedDriver = await apiClient.updateDriverLocation(coords, 'foreground');
    const fetchCountAfter = global.fetch.mock.calls.length;

    expect(fetchCountAfter - fetchCountBefore).toBe(0);
    expect(updatedDriver.location).toEqual({
      type: 'Point',
      coordinates: [coords.longitude, coords.latitude],
    });

    const { getDemoState } = require('../../api/demo/localStore');
    const state = await getDemoState();
    const userId = apiClient.user._id;
    expect(state.driverProfiles[userId].location.coordinates).toEqual([
      coords.longitude,
      coords.latitude,
    ]);
  });

  it('persists local demo state across module reloads for locally registered drivers', async () => {
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
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith(
      apiUrl('/resource/drivers/byUserId'),
      expect.any(Object)
    );
  });
});
