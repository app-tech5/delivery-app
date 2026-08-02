import './tasks/driverLocationTask';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { DriverProvider } from './contexts/DriverContext';
import { OrdersProvider } from './contexts/OrdersContext';
import { SettingProvider } from './contexts/SettingContext';

export default function App() {
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
