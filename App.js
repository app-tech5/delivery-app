import './tasks/driverLocationTask';
import './utils/hermesAutoOkAlerts';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { DriverProvider } from './contexts/DriverContext';
import { OrdersProvider } from './contexts/OrdersContext';
import { SettingProvider } from './contexts/SettingContext';
import { installWebScrollFix } from './utils/installWebScrollFix';
import { installWebAlertPolyfill } from './utils/installWebAlertPolyfill';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      installWebScrollFix();
      installWebAlertPolyfill();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <DriverProvider>
        <OrdersProvider>
          <SettingProvider>
            <AppNavigator />
          </SettingProvider>
        </OrdersProvider>
      </DriverProvider>
    </SafeAreaProvider>
  );
}
