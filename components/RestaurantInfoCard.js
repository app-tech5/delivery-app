import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Card, Icon, Button } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { Linking } from 'react-native';

import { openMapsNavigation } from '../utils/navigationUtils';
import { useDriver } from '../contexts/DriverContext';
import { isDemoDriverAccount } from '../utils/demoDriverUtils';
import { getDriverCoordinatesPoint } from '../utils/locationUtils';
import apiClient from '../api';

const RestaurantInfoCard = ({ order }) => {
  const { driver } = useDriver();
  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      const url = `tel:${phoneNumber}`;
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      });
    }
  };

  return (
    <Card containerStyle={styles.infoCard}>
      <View style={styles.cardHeader}>
        <Icon name="restaurant" type="material" size={20} color={colors.primary} />
        <Text style={styles.cardTitle}>{i18n.t('orderDetails.restaurant')}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Text style={styles.label}>{i18n.t('profile.fullName')}:</Text>
        <Text style={styles.value}>{order.restaurant?.name || 'N/A'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>{i18n.t('orderDetails.restaurantPhone')}:</Text>
        <Text style={styles.value}>{order.restaurant?.phone || 'N/A'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>{i18n.t('orderDetails.pickupAddress')}:</Text>
        <Text style={styles.value}>{order.restaurant?.address || i18n.t('reports.addressNotAvailable')}</Text>
      </View>

      <View style={styles.actionButtons}>
        <Button
          title={i18n.t('orderDetails.callRestaurant')}
          onPress={() => handleCall(order.restaurant?.phone)}
          containerStyle={styles.actionButtonContainer}
          buttonStyle={styles.callButton}
          icon={
            <Icon name="phone" type="material" size={16} color={colors.white} style={{ marginRight: 8 }} />
          }
        />
        <Button
          title={i18n.t('orderDetails.navigateToRestaurant')}
          onPress={() => openMapsNavigation({
            destination: {
              address: order.restaurant?.address,
              latitude: order.restaurant?.latitude,
              longitude: order.restaurant?.longitude,
            },
            origin: getDriverCoordinatesPoint(driver),
            requireOrigin: isDemoDriverAccount(apiClient.user, driver),
          })}
          containerStyle={styles.actionButtonContainer}
          buttonStyle={styles.navigateButton}
          icon={
            <Icon name="navigation" type="material" size={16} color={colors.white} style={{ marginRight: 8 }} />
          }
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background.secondary,
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  actionButtons: {
    marginTop: 16,
    gap: 12,
  },
  actionButtonContainer: {
    width: '100%',
  },
  callButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },
  navigateButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: 12,
  },
});

export default RestaurantInfoCard;

