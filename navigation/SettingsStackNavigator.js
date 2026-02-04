import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/SettingsScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import i18n from '../i18n';

const Stack = createStackNavigator();

export default function SettingsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          title: i18n.t('navigation.settings'),
        }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{
          title: i18n.t('payment.paymentMethodsTitle'),
        }}
      />
    </Stack.Navigator>
  );
}
