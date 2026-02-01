import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Icon, Chip } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { formatCurrency, formatDate, getTransactionColor, getTransactionIcon } from '../utils/transactionUtils';

const TransactionItem = ({ transaction, currency }) => {
  return (
    <Card containerStyle={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIcon}>
          <Icon
            name={getTransactionIcon(transaction.type)}
            type="material-community"
            size={20}
            color={getTransactionColor(transaction.type)}
          />
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>
            {transaction.description}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(transaction.date)}
          </Text>
        </View>

        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountValue,
            { color: getTransactionColor(transaction.type) }
          ]}>
            +{formatCurrency(transaction.amount, currency)}
          </Text>
          <Chip
            title={i18n.t('reports.completedStatus')}
            buttonStyle={styles.statusChip}
            titleStyle={styles.statusChipText}
          />
        </View>
      </View>

      {/* Détails supplémentaires */}
      {(transaction.details?.address || transaction.details?.customer) && (
        <View style={styles.transactionDetails}>
          {transaction.details?.address && (
            <Text style={styles.detailText}>
              📍 {transaction.details.address}
            </Text>
          )}
          {transaction.details?.customer && (
            <Text style={styles.detailText}>
              👤 {transaction.details.customer}
            </Text>
          )}
          {transaction.details?.restaurant && (
            <Text style={styles.detailText}>
              🏪 {transaction.details.restaurant}
            </Text>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusChip: {
    height: 34,
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.background.secondary,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default TransactionItem;
