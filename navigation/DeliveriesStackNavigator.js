import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DeliveriesScreen from '../screens/DeliveriesScreen';
import DeliveryDetailsScreen from '../screens/DeliveryDetailsScreen';
import i18n from '../i18n';

const Stack = createStackNavigator();

export default function DeliveriesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="DeliveriesMain"
        component={DeliveriesScreen}
        options={{
          title: i18n.t('navigation.deliveries'),
        }}
      />
      <Stack.Screen
        name="DeliveryDetails"
        component={DeliveryDetailsScreen}
        options={{
          title: i18n.t('navigation.deliveryDetails'),
        }}
      />
    </Stack.Navigator>
  );
}


