import { getDriverStatusLabel } from './statusUtils';
import { updateDriverCache, clearDriverCache } from './storageUtils';

export const INITIAL_STATS = {
  todayDeliveries: 0,
  totalEarnings: 0,
  rating: 0,
  completedOrders: 0
};

export const isDriverAuthenticated = (driver) => {
  return driver && driver._id;
};

export { getDriverStatusLabel as getStatusLabel };
export {
  updateDriverCache,
  clearDriverCache,
  getDriverSessionFromCache,
} from './storageUtils';
