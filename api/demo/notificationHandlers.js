import { getDemoState, updateDemoState } from './localStore';

export function applyNotificationOverrides(notifications = [], state) {
  const readIds = new Set((state.notificationReadIds || []).map(String));
  const removedIds = new Set((state.notificationRemovedIds || []).map(String));

  return notifications
    .filter((notification) => !removedIds.has(String(notification._id || notification.id)))
    .map((notification) => {
      const id = String(notification._id || notification.id);
      if (readIds.has(id)) {
        return { ...notification, isRead: true };
      }
      return notification;
    });
}

export async function mergeDemoNotifications(data) {
  const state = await getDemoState();
  const notifications = Array.isArray(data) ? data : [];
  return applyNotificationOverrides(notifications, state);
}

export async function markDemoNotificationReadLocally(notificationId) {
  const id = String(notificationId);

  await updateDemoState((state) => ({
    ...state,
    notificationReadIds: [...new Set([...(state.notificationReadIds || []), id])],
  }));

  return { success: true };
}

export async function deleteDemoNotificationLocally(notificationId) {
  const id = String(notificationId);

  await updateDemoState((state) => ({
    ...state,
    notificationRemovedIds: [...new Set([...(state.notificationRemovedIds || []), id])],
    notificationReadIds: (state.notificationReadIds || []).filter((readId) => readId !== id),
  }));

  return { success: true };
}
