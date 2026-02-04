import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import i18n from '../i18n';
import { colors } from '../global';

const VehicleInfoCard = ({ vehicle }) => {
  if (!vehicle || (!vehicle.type && !vehicle.model && !vehicle.licensePlate)) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="directions-car" size={48} color={colors.text.secondary} />
        <Text style={styles.emptyTitle}>{i18n.t('vehicle.noVehicleInfo')}</Text>
        <Text style={styles.emptySubtitle}>{i18n.t('vehicle.vehicleInfoNeeded')}</Text>
      </View>
    );
  }

  const getVehicleIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'scooter':
      case 'scooter électrique':
        return 'electric-scooter';
      case 'moto':
      case 'motorcycle':
        return 'motorcycle';
      case 'voiture':
      case 'car':
        return 'directions-car';
      case 'vélo':
      case 'bicycle':
        return 'pedal-bike';
      case 'camion':
      case 'truck':
        return 'local-shipping';
      default:
        return 'directions-car';
    }
  };

  const getVehicleTypeName = (type) => {
    if (!type) return i18n.t('vehicle.unknown');

    switch (type.toLowerCase()) {
      case 'scooter':
        return i18n.t('vehicle.scooter');
      case 'scooter électrique':
        return i18n.t('vehicle.electricScooter');
      case 'moto':
      case 'motorcycle':
        return i18n.t('vehicle.motorcycle');
      case 'voiture':
      case 'car':
        return i18n.t('vehicle.car');
      case 'vélo':
      case 'bicycle':
        return i18n.t('vehicle.bicycle');
      case 'camion':
      case 'truck':
        return i18n.t('vehicle.truck');
      default:
        return type;
    }
  };

  const formatLicensePlate = (plate) => {
    if (!plate) return '';
    // Format français standard: AA-123-AA
    return plate.toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* Header avec icône et titre */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={getVehicleIcon(vehicle.type)}
            size={28}
            color={colors.primary}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{i18n.t('vehicle.vehicleDetails')}</Text>
          <Text style={styles.subtitle}>
            {getVehicleTypeName(vehicle.type)}
          </Text>
        </View>
      </View>

      {/* Informations détaillées */}
      <View style={styles.detailsContainer}>
        {vehicle.model && (
          <View style={styles.detailRow}>
            <MaterialIcons name="build" size={20} color={colors.text.secondary} />
            <Text style={styles.detailLabel}>{i18n.t('vehicle.model')}:</Text>
            <Text style={styles.detailValue}>{vehicle.model}</Text>
          </View>
        )}

        {vehicle.licensePlate && (
          <View style={styles.detailRow}>
            <MaterialIcons name="credit-card" size={20} color={colors.text.secondary} />
            <Text style={styles.detailLabel}>{i18n.t('vehicle.licensePlate')}:</Text>
            <Text style={styles.detailValue}>{formatLicensePlate(vehicle.licensePlate)}</Text>
          </View>
        )}

        {vehicle.type && (
          <View style={styles.detailRow}>
            <MaterialIcons name="category" size={20} color={colors.text.secondary} />
            <Text style={styles.detailLabel}>{i18n.t('vehicle.type')}:</Text>
            <Text style={styles.detailValue}>{getVehicleTypeName(vehicle.type)}</Text>
          </View>
        )}

        {/* Status du véhicule */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {i18n.t('vehicle.vehicleActive')}
            </Text>
          </View>
        </View>
      </View>

      {/* Section sécurité */}
      <View style={styles.securitySection}>
        <View style={styles.securityHeader}>
          <FontAwesome name="shield" size={16} color={colors.success} />
          <Text style={styles.securityTitle}>{i18n.t('vehicle.safetyInfo')}</Text>
        </View>
        <Text style={styles.securityText}>
          {i18n.t('vehicle.safetyDescription')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 12,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  statusContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.background.secondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  securitySection: {
    backgroundColor: colors.success + '10',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    marginLeft: 8,
  },
  securityText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default VehicleInfoCard;
