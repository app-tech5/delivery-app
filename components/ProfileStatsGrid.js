import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function ProfileStatsGrid({ stats, currencySymbol = '€' }) {
  const items = [
    {
      key: 'deliveries',
      value: stats.totalDeliveries,
      label: i18n.t('profile.totalDeliveries'),
      color: colors.primary,
    },
    {
      key: 'earnings',
      value: `${stats.totalEarnings.toFixed(2)}${currencySymbol}`,
      label: i18n.t('profile.totalEarnings'),
      color: colors.success,
    },
    {
      key: 'rating',
      value: stats.averageRating.toFixed(1),
      label: i18n.t('profile.averageRating'),
      color: colors.warning,
    },
    {
      key: 'completion',
      value: `${stats.completionRate}%`,
      label: i18n.t('profile.completionRate'),
      color: colors.info,
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{i18n.t('profile.statistics')}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <Card
            key={item.key}
            containerStyle={[styles.card, { backgroundColor: item.color, width: CARD_WIDTH }]}
          >
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 0,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
  },
});
