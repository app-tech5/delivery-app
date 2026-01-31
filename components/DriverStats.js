import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../global';
import { StatsGrid } from './index';
import { formatCurrency } from '../utils';
import i18n from '../i18n';

const DriverStats = ({ stats, currency }) => {
  if (!stats) return null;

  const statsData = [
    {
      value: stats.todayDeliveries || 0,
      label: i18n.t('home.todayDeliveries'),
      containerStyle: { alignItems: 'center' }
    },
    {
      value: formatCurrency(stats.totalEarnings || 0, currency),
      label: i18n.t('home.earnings'),
      containerStyle: { alignItems: 'center' }
    },
    {
      value: stats.rating || 0,
      label: i18n.t('home.rating'),
      containerStyle: { alignItems: 'center' }
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{i18n.t('home.todayDeliveries')}</Text>
      <StatsGrid stats={statsData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
    marginLeft: 0,
  },
});

export default DriverStats;
