import { useDriver } from '../contexts/DriverContext';

export const useAuthGuard = () => {
  const { isAuthenticated, driver } = useDriver();

  return {
    isAuthenticated,
    driver,
    isAuthValid: isAuthenticated && driver,
    needsAuth: !isAuthenticated || !driver
  };
};

