export const EMPTY_PROFILE_EDIT_DATA = {
  fullName: '',
  phone: '',
  address: '',
  image: '',
  licenseNumber: '',
  vehicleType: '',
  vehicleModel: '',
  licensePlate: '',
};

export const buildProfileEditData = (driver) => {
  const vehicle = driver?.vehicle || {};
  return {
    fullName: driver?.userId?.name || '',
    phone: driver?.userId?.phone || '',
    address: driver?.userId?.address || '',
    image: driver?.userId?.image || '',
    licenseNumber: driver?.licenseNumber || '',
    vehicleType: vehicle.type || '',
    vehicleModel: vehicle.model || '',
    licensePlate: vehicle.licensePlate || '',
  };
};

export const buildProfileStats = (driver, stats) => ({
  totalDeliveries: stats.completedOrders || 0,
  totalEarnings: stats.totalEarnings || 0,
  averageRating: stats.rating || 0,
  completionRate: stats.completedOrders && driver
    ? Math.round((stats.completedOrders / (stats.completedOrders + 5)) * 100)
    : 0,
  memberSince: driver?.createdAt
    ? new Date(driver.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'January 2024',
});

export const mergeDriverWithUser = (updatedDriver, updatedUser) => ({
  ...updatedDriver,
  userId: {
    ...(typeof updatedDriver.userId === 'object' ? updatedDriver.userId : {}),
    ...updatedUser,
  },
});
