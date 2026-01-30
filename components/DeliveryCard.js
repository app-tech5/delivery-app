import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Icon, Button, Badge } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { useSettings } from '../contexts/SettingContext';

export default function DeliveryCard({
  delivery,
  onAccept,
  onStartDelivery,
  onMarkDelivered,
  showActions = true,
  compact = false
}) {
  const { currency } = useSettings();

  const formatCurrency = (amount) => {
    return `${amount?.toFixed(2) || '0.00'}${currency?.symbol || '€'}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(i18n.locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'accepted': return colors.info;
      case 'out_for_delivery': return colors.primary;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.text.secondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return i18n.t('reports.pendingLabel');
      case 'accepted': return i18n.t('reports.acceptedLabel');
      case 'out_for_delivery': return i18n.t('reports.outForDeliveryLabel');
      case 'delivered': return i18n.t('reports.deliveredLabel');
      case 'cancelled': return i18n.t('reports.cancelledLabel');
      default: return status;
    }
  };

  const renderActions = () => {
    if (!showActions) return null;

    switch (delivery.status) {
      case 'pending':
        return (
          <Button
            title={i18n.t('reports.acceptButton')}
            onPress={() => onAccept(delivery._id)}
            buttonStyle={styles.acceptButton}
            icon={
              <Icon
                name="check"
                type="material"
                size={16}
                color={colors.white}
                style={{ marginRight: 8 }}
              />
            }
          />
        );

      case 'accepted':
        return (
          <Button
            title={i18n.t('reports.startButton')}
            onPress={() => onStartDelivery(delivery._id)}
            buttonStyle={styles.startButton}
          />
        );

      case 'out_for_delivery':
        return (
          <Button
            title={i18n.t('reports.deliveredButton')}
            onPress={() => onMarkDelivered(delivery._id)}
            buttonStyle={styles.deliveredButton}
            icon={
              <Icon
                name="check-circle"
                type="material"
                size={16}
                color={colors.white}
                style={{ marginRight: 8 }}
              />
            }
          />
        );

      default:
        return null;
    }
  };

  if (compact) {
    // Version compacte pour les listes
    return (
      <Card containerStyle={styles.compactCard}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactId}>#{delivery._id.slice(-6)}</Text>
          <Badge
            value={getStatusLabel(delivery.status)}
            status={delivery.status === 'delivered' ? 'success' : 'primary'}
            containerStyle={styles.compactBadge}
          />
          <Text style={styles.compactAmount}>
            {formatCurrency(delivery.delivery?.deliveryFee || 0)}
          </Text>
        </View>

        <Text style={styles.compactAddress}>
          📍 {delivery.delivery?.address || i18n.t('reports.addressNotAvailable')}
        </Text>

        {delivery.user && (
          <Text style={styles.compactCustomer}>
            👤 {delivery.user.name}
          </Text>
        )}

        <Text style={styles.compactDate}>
          {formatDate(delivery.createdAt || delivery.updatedAt)}
        </Text>

        {renderActions()}
      </Card>
    );
  }

  // Version complète
  return (
    <Card containerStyle={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.id}>{i18n.t('reports.orderPrefix')}{delivery._id.slice(-6)}</Text>
          <Text style={styles.date}>
            {formatDate(delivery.createdAt || delivery.updatedAt)}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Badge
            value={getStatusLabel(delivery.status)}
            status={delivery.status === 'delivered' ? 'success' : 'primary'}
            containerStyle={styles.statusBadge}
          />
          <Text style={styles.amount}>
            {formatCurrency(delivery.delivery?.deliveryFee || 0)}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.address}>
          📍 {delivery.delivery?.address || i18n.t('reports.addressNotAvailable')}
        </Text>

        {delivery.user && (
          <Text style={styles.customer}>
            👤 {delivery.user.name} - {delivery.user.phone}
          </Text>
        )}

        {delivery.restaurant && (
          <Text style={styles.restaurant}>
            🏪 {delivery.restaurant.name}
          </Text>
        )}
      </View>

      {renderActions() && (
        <View style={styles.actions}>
          {renderActions()}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  // Version complète
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  id: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  details: {
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  customer: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  restaurant: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  actions: {
    marginTop: 8,
  },
  acceptButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
  },
  startButton: {
    backgroundColor: colors.info,
    borderRadius: 8,
  },
  deliveredButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },

  // Version compacte
  compactCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  compactBadge: {
    flex: 1,
    alignItems: 'center',
  },
  compactAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  compactAddress: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  compactCustomer: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  compactDate: {
    fontSize: 10,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});
