import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';

const StatusButton = ({ status, label, icon, isActive, onPress, disabled }) => (
  <TouchableOpacity
    style={[
      styles.statusButton,
      isActive && styles.statusButtonActive,
      status === 'busy' && styles.statusButtonBusy,
      status === 'offline' && styles.statusButtonOffline
    ]}
    onPress={() => onPress(status)}
    disabled={disabled}
  >
    <Icon name={icon} type="material" size={24} color={colors.white} />
    <Text style={styles.statusButtonText}>{label}</Text>
  </TouchableOpacity>
);

const StatusButtons = ({ currentStatus, onStatusChange, isLoading }) => {
  const statusConfig = [
    {
      status: 'available',
      label: i18n.t('driver.available'),
      icon: 'check-circle'
    },
    {
      status: 'busy',
      label: i18n.t('driver.busy'),
      icon: 'work'
    },
    {
      status: 'offline',
      label: i18n.t('driver.offline'),
      icon: 'power-settings-new'
    }
  ];

  return (
    <View style={styles.statusButtons}>
      {statusConfig.map((config) => (
        <StatusButton
          key={config.status}
          status={config.status}
          label={config.label}
          icon={config.icon}
          isActive={currentStatus === config.status}
          onPress={onStatusChange}
          disabled={isLoading}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: colors.white,
    margin: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.grey[300],
    minWidth: 80,
  },
  statusButtonActive: {
    backgroundColor: colors.primary,
  },
  statusButtonBusy: {
    backgroundColor: colors.driver.busy,
  },
  statusButtonOffline: {
    backgroundColor: colors.driver.offline,
  },
  statusButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
});

export default StatusButtons;
