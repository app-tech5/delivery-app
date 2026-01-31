import React from 'react';
import { View, Text } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { colors } from '../global';
import { formatCurrency, getRatingColor } from '../utils';
import i18n from '../i18n';

const DetailRow = ({ label, value, children }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <View style={styles.detailValueContainer}>
      {children || <Text style={styles.detailValue}>{value}</Text>}
    </View>
  </View>
);

const EarningsDetailsCard = ({ stats, currency }) => {
  if (!stats) return null;

  const averageEarnings = stats.todayDeliveries > 0
    ? stats.totalEarnings / stats.todayDeliveries
    : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{i18n.t('reports.earningsDetails')}</Text>

      <Card containerStyle={styles.detailCard}>
        <DetailRow
          label={i18n.t('reports.deliveriesCompletedToday')}
          value={stats.todayDeliveries || 0}
        />

        <DetailRow
          label={i18n.t('reports.averageEarningsPerDelivery')}
          value={formatCurrency(averageEarnings, currency)}
        />

        <DetailRow label={i18n.t('reports.currentRating')}>
          <View style={styles.ratingContainer}>
            <Text style={styles.detailValue}>{stats.rating?.toFixed(1) || '0.0'}</Text>
            <View style={styles.miniStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name={star <= Math.floor(stats.rating || 0) ? 'star' : 'star-border'}
                  type="material"
                  size={10}
                  color={getRatingColor(stats.rating || 0)}
                />
              ))}
            </View>
          </View>
        </DetailRow>
      </Card>
    </View>
  );
};

const styles = {
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  detailCard: {
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniStars: {
    flexDirection: 'row',
    marginLeft: 8,
  },
};

export default EarningsDetailsCard;
