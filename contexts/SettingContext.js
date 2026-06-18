import React, { createContext, useContext } from 'react';
import { useDriver } from './DriverContext';
import { useSettingsManager } from '../hooks/useSettingsManager';

const SettingContext = createContext();

export function SettingProvider({ children }) {
  const { isAuthenticated, needsOnboarding, isLoading } = useDriver();
  const settingsData = useSettingsManager(
    !isLoading && isAuthenticated && !needsOnboarding
  );

  const value = {
    ...settingsData
  };

  return (
    <SettingContext.Provider value={value}>
      {children}
    </SettingContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingContext);
  if (!context) {
    throw new Error('useSettings doit être utilisé dans un SettingProvider');
  }
  return context;
}

export { getSettingsCacheInfo } from '../utils/settingsUtils';

export default SettingContext;
