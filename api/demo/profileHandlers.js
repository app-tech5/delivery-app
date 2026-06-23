import { getDemoState, updateDemoState } from './localStore';

export function applyProfilePatch(driver, profilePatch) {
  if (!driver || !profilePatch) return driver;

  const next = { ...driver };
  const { user, driver: driverPatch } = profilePatch;

  if (driverPatch) {
    if (driverPatch.licenseNumber != null) {
      next.licenseNumber = driverPatch.licenseNumber;
    }
    if (driverPatch.vehicle) {
      next.vehicle = { ...(next.vehicle || {}), ...driverPatch.vehicle };
    }
    if (driverPatch.documents) {
      next.documents = driverPatch.documents;
    }
  }

  if (user && Object.keys(user).length > 0) {
    next.userId = {
      ...(typeof next.userId === 'object' ? next.userId : {}),
      ...user,
    };
  }

  return next;
}

export async function mergeDemoDriverProfile(driver) {
  if (!driver) return driver;
  const state = await getDemoState();
  return applyProfilePatch(driver, state.profilePatch);
}

export async function updateDemoUserLocally(userData, currentUser) {
  await updateDemoState((state) => ({
    ...state,
    profilePatch: {
      ...(state.profilePatch || {}),
      user: { ...(state.profilePatch?.user || {}), ...userData },
    },
  }));

  return { ...(currentUser || {}), ...userData };
}

export async function updateDemoDriverProfileLocally(profileData, currentDriver) {
  await updateDemoState((state) => ({
    ...state,
    profilePatch: {
      ...(state.profilePatch || {}),
      driver: {
        ...(state.profilePatch?.driver || {}),
        ...profileData,
        vehicle: profileData.vehicle
          ? { ...(state.profilePatch?.driver?.vehicle || {}), ...profileData.vehicle }
          : state.profilePatch?.driver?.vehicle,
      },
    },
  }));

  const state = await getDemoState();
  return applyProfilePatch(currentDriver, state.profilePatch);
}

export function uploadDemoPublicFileLocally(asset) {
  return typeof asset === 'string' ? asset : asset.uri;
}

export const uploadDemoFileLocally = uploadDemoPublicFileLocally;
