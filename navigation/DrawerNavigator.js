import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Alert } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import DeliveriesScreen from '../screens/DeliveriesScreen';
import EarningsScreen from '../screens/EarningsScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SupportScreen from '../screens/SupportScreen';
import { Ionicons, MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
import i18n from '../i18n';
import { colors } from '../global';
import { useDriver } from '../contexts/DriverContext';

const Drawer = createDrawerNavigator();

// Composant personnalisé pour le contenu du drawer
function CustomDrawerContent(props) {
  const { logout } = useDriver();

  const handleLogout = async () => {
    Alert.alert(
      i18n.t('navigation.logout'),
      i18n.t('common.confirmLogout'),
      [
        {
          text: i18n.t('common.cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('navigation.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // La navigation vers l'écran de login sera gérée par l'App.js ou le contexte d'authentification
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
            }
          },
        },
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={{ marginTop: 'auto', marginBottom: 20 }}>
        <DrawerItem
          label={i18n.t('navigation.logout')}
          onPress={handleLogout}
          icon={({ focused, size }) => (
            <Ionicons
              name="log-out-outline"
              color="#ff4444"
              size={size}
            />
          )}
          labelStyle={{
            color: '#ff4444',
            fontSize: 16,
            fontWeight: '500',
            marginLeft: 8,
          }}
          style={{
            marginVertical: 2,
            marginHorizontal: 8,
            borderRadius: 8,
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#ffffff',
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          marginLeft: 8,
        },
        drawerItemStyle: {
          marginVertical: 2,
          marginHorizontal: 8,
          borderRadius: 8,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: '#666',
        drawerActiveBackgroundColor: 'rgba(0, 0, 0, 0.08)',
        drawerInactiveBackgroundColor: 'transparent',
      }}
    >
      {/* 🏠 TABLEAU DE BORD */}
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: i18n.t('navigation.home'),
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name="home-outline"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* 🚚 LIVRAISONS ACTIVES */}
      <Drawer.Screen
        name="Deliveries"
        component={DeliveriesScreen}
        options={{
          title: i18n.t('navigation.deliveries'),
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name="car-outline"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* 💰 REVENUS & TRANSACTIONS */}
      <Drawer.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          title: i18n.t('home.earnings'),
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons
              name="attach-money"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* 💳 TRANSACTIONS */}
      <Drawer.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: i18n.t('navigation.transactions'),
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name="card-outline"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* 📊 HISTORIQUE DES LIVRAISONS */}
      <Drawer.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: i18n.t('navigation.history'),
          drawerIcon: ({ focused, size }) => (
            <Feather
              name="clock"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* 📈 RAPPORTS */}
      <Drawer.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: i18n.t('navigation.reports'),
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name="bar-chart-outline"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* 🔔 NOTIFICATIONS */}
      <Drawer.Screen
        name="Notifications"
        component={ProfileScreen} // Temporaire - utiliser ProfileScreen
        options={{
          title: i18n.t('navigation.notifications'),
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name="notifications-outline"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* 🆘 SUPPORT CLIENT */}
      <Drawer.Screen
        name="Support"
        component={SupportScreen}
        options={{
          title: i18n.t('navigation.support'),
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name="help-circle-outline"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* 👤 PROFIL */}
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: i18n.t('navigation.profile'),
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name="person-outline"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* ⚙️ PARAMÈTRES */}
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: i18n.t('navigation.settings'),
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name="settings-outline"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}