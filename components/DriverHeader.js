import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global';
import { getStatusColor } from '../utils';

const DriverHeader = ({ driver }) => {
  if (!driver) return null;

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.driverInfo}>
          {driver?.userId?.image ? (
            <Image
              source={{ uri: driver.userId.image }}
              style={styles.driverImage}
            />
          ) : (
            <Icon
              name="person"
              type="material"
              size={40}
              color={colors.white}
              containerStyle={styles.avatar}
            />
          )}
          <View>
            <Text style={styles.driverName}>
              {driver?.userId?.name || 'Driver'}
            </Text>
            <Text style={styles.driverId}>
              ID: {driver?.licenseNumber || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(driver?.status, 'driver') }
          ]} />
          <Text style={styles.statusText}>
            {driver?.status || 'unknown'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 15,
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: colors.white,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  driverId: {
    fontSize: 14,
    color: colors.grey[300],
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DriverHeader;
