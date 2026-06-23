import {
  applyProfilePatch,
  mergeDemoDriverProfile,
  updateDemoUserLocally,
  updateDemoDriverProfileLocally,
  uploadDemoPublicFileLocally,
  uploadDemoFileLocally,
} from '../../api/demo/profileHandlers';
import { getDemoState, updateDemoState } from '../../api/demo/localStore';

jest.mock('../../api/demo/localStore', () => ({
  getDemoState: jest.fn(),
  updateDemoState: jest.fn(),
}));

describe('profileHandlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateDemoState.mockImplementation(async (updater) => {
      const current = { profilePatch: null };
      return typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    });
  });

  it('applies user and driver patches to a driver profile', () => {
    const driver = {
      _id: 'driver-1',
      licenseNumber: 'OLD',
      vehicle: { type: 'car', model: 'A', licensePlate: 'AA-111' },
      userId: { name: 'John', phone: '1', address: 'Paris', image: '' },
    };

    const patched = applyProfilePatch(driver, {
      user: { name: 'Jane', phone: '2' },
      driver: { licenseNumber: 'NEW', vehicle: { model: 'B' } },
    });

    expect(patched.licenseNumber).toBe('NEW');
    expect(patched.vehicle.model).toBe('B');
    expect(patched.vehicle.type).toBe('car');
    expect(patched.userId.name).toBe('Jane');
    expect(patched.userId.phone).toBe('2');
  });

  it('stores demo user updates locally', async () => {
    getDemoState.mockResolvedValue({
      profilePatch: { user: { name: 'Jane' } },
    });

    const updated = await updateDemoUserLocally(
      { name: 'Jane', phone: '99' },
      { _id: 'user-1', name: 'John' }
    );

    expect(updateDemoState).toHaveBeenCalled();
    expect(updated).toEqual({ _id: 'user-1', name: 'Jane', phone: '99' });
  });

  it('merges stored demo patch when loading driver profile', async () => {
    getDemoState.mockResolvedValue({
      profilePatch: {
        user: { name: 'Demo Driver' },
        driver: { licenseNumber: 'DEMO-99' },
      },
    });

    const merged = await mergeDemoDriverProfile({
      _id: 'driver-1',
      licenseNumber: 'BASE',
      userId: { name: 'Base' },
    });

    expect(merged.licenseNumber).toBe('DEMO-99');
    expect(merged.userId.name).toBe('Demo Driver');
  });

  it('keeps local uri for demo file upload', () => {
    expect(uploadDemoPublicFileLocally({ uri: 'file:///avatar.jpg' })).toBe('file:///avatar.jpg');
    expect(uploadDemoFileLocally({ uri: 'file:///license.pdf' })).toBe('file:///license.pdf');
  });

  it('persists demo driver profile updates locally', async () => {
    getDemoState.mockResolvedValue({
      profilePatch: {
        driver: {
          licenseNumber: 'DEMO-42',
          vehicle: { type: 'bike', model: 'X', licensePlate: 'ZZ-999' },
        },
      },
    });

    const updated = await updateDemoDriverProfileLocally(
      {
        licenseNumber: 'DEMO-42',
        vehicle: { type: 'bike', model: 'X', licensePlate: 'ZZ-999' },
      },
      {
        _id: 'driver-1',
        licenseNumber: 'OLD',
        vehicle: { type: 'car', model: 'A', licensePlate: 'AA-111' },
        userId: { name: 'John' },
      }
    );

    expect(updated.licenseNumber).toBe('DEMO-42');
    expect(updated.vehicle.licensePlate).toBe('ZZ-999');
  });
});
