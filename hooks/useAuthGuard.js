import { useDriver } from '../contexts/DriverContext';

/**
 * Hook personnalisé pour gérer l'état d'authentification
 * @returns {Object} État d'authentification et données du driver
 */
export const useAuthGuard = () => {
  const { isAuthenticated, driver } = useDriver();

  return {
    isAuthenticated,
    driver,
    isAuthValid: isAuthenticated && driver,
    needsAuth: !isAuthenticated || !driver
  };
};


