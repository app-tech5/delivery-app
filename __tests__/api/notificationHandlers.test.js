jest.mock('../../api/demo/localStore', () => ({
  getDemoState: jest.fn(),
  updateDemoState: jest.fn(),
}));

import { getDemoState, updateDemoState } from '../../api/demo/localStore';
import {
  applyNotificationOverrides,
  mergeDemoNotifications,
  markDemoNotificationReadLocally,
  deleteDemoNotificationLocally,
} from '../../api/demo/notificationHandlers';

describe('notificationHandlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDemoState.mockResolvedValue({
      notificationReadIds: [],
      notificationRemovedIds: [],
    });
    updateDemoState.mockImplementation(async (updater) =>
      typeof updater === 'function' ? updater(await getDemoState()) : updater
    );
  });

  it('applies local read and delete overrides on backend data', () => {
    const notifications = applyNotificationOverrides(
      [
        { _id: 'n1', isRead: false, title: 'A' },
        { _id: 'n2', isRead: false, title: 'B' },
        { _id: 'n3', isRead: false, title: 'C' },
      ],
      {
        notificationReadIds: ['n2'],
        notificationRemovedIds: ['n3'],
      }
    );

    expect(notifications).toEqual([
      { _id: 'n1', isRead: false, title: 'A' },
      { _id: 'n2', isRead: true, title: 'B' },
    ]);
  });

  it('merges demo overrides after a backend read', async () => {
    getDemoState.mockResolvedValue({
      notificationReadIds: ['n1'],
      notificationRemovedIds: [],
    });

    const merged = await mergeDemoNotifications([{ _id: 'n1', isRead: false }]);

    expect(merged).toEqual([{ _id: 'n1', isRead: true }]);
  });

  it('stores mark-as-read locally in demo mode', async () => {
    await markDemoNotificationReadLocally('n1');

    expect(updateDemoState).toHaveBeenCalled();
  });

  it('stores delete locally in demo mode', async () => {
    getDemoState.mockResolvedValue({
      notificationReadIds: ['n1'],
      notificationRemovedIds: [],
    });

    await deleteDemoNotificationLocally('n1');

    expect(updateDemoState).toHaveBeenCalled();
  });
});
