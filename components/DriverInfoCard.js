import React from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
import { Card, Icon, Button } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';

const getAssignedDriver = (order) => {
  const d = order?.driver;
  if (d == null || d === '') return null;
  if (typeof d === 'string') return { _id: d, userId: null, vehicle: null };
  return d;
};

const DriverInfoCard = ({ order }) => {
  const driver = getAssignedDriver(order);

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      const url = `tel:${phoneNumber}`;
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      });
    }
  };

  const user = driver?.userId && typeof driver.userId === 'object' ? driver.userId : null;
  const vehicle = driver?.vehicle && typeof driver.vehicle === 'object' ? driver.vehicle : null;
  const phone = user?.phone;
  const name = user?.name;
  const vehicleLine = vehicle
    ? [vehicle.type, vehicle.model, vehicle.licensePlate].filter(Boolean).join(' · ') || null
    : null;

  return (
    <Card containerStyle={styles.infoCard}>
      <View style={styles.cardHeader}>
        <Icon name="local-shipping" type="material" size={20} color={colors.primary} />
        <Text style={styles.cardTitle}>{i18n.t('orderDetails.driver')}</Text>
      </View>

      <View style={styles.divider} />

      {!driver ? (
        <Text style={styles.value}>{i18n.t('orderDetails.noDriverAssigned')}</Text>
      ) : (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{i18n.t('profile.fullName')}:</Text>
            <Text style={styles.value}>{name || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>{i18n.t('orderDetails.driverPhone')}:</Text>
            <Text style={styles.value}>{phone || 'N/A'}</Text>
          </View>

          {vehicleLine ? (
            <View style={styles.infoRow}>
              <Text style={styles.label}>{i18n.t('orderDetails.vehicle')}:</Text>
              <Text style={styles.value}>{vehicleLine}</Text>
            </View>
          ) : null}

          {phone ? (
            <View style={styles.actionButtons}>
              <Button
                title={i18n.t('orderDetails.callDriver')}
                onPress={() => handleCall(phone)}
                buttonStyle={styles.callButton}
                icon={
                  <Icon name="phone" type="material" size={16} color={colors.white} style={{ marginRight: 8 }} />
                }
              />
            </View>
          ) : null}
        </>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  callButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 1,
  },
});

export default DriverInfoCard;
