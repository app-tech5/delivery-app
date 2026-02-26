import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { formatCurrency } from '../utils';

const OrderItemsCard = ({ order, currency }) => {
  return (
    <Card containerStyle={styles.itemsCard}>
      <View style={styles.cardHeader}>
        <Icon name="shopping-cart" type="material" size={20} color={colors.primary} />
        <Text style={styles.cardTitle}>{i18n.t('orderDetails.items')}</Text>
      </View>

      <View style={styles.divider} />

      {order.items?.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemTotal}>
              {formatCurrency(item.total, currency)}
            </Text>
          </View>

          <View style={styles.itemDetails}>
            <Text style={styles.itemQuantity}>
              {i18n.t('orderDetails.quantity')}: {item.quantity}
            </Text>
            <Text style={styles.itemPrice}>
              {formatCurrency(item.price, currency)} {i18n.t('orderDetails.item').toLowerCase()}
            </Text>
          </View>

          {item.extras && item.extras.length > 0 && (
            <View style={styles.extrasContainer}>
              <Text style={styles.extrasTitle}>{i18n.t('orderDetails.extras')}:</Text>
              {item.extras.map((extra, extraIndex) => (
                <Text key={extraIndex} style={styles.extraItem}>
                  • {extra.name} (+{formatCurrency(extra.price * extra.quantity, currency)})
                </Text>
              ))}
            </View>
          )}

          {item.variants && item.variants.length > 0 && (
            <View style={styles.variantsContainer}>
              <Text style={styles.variantsTitle}>{i18n.t('orderDetails.variants')}:</Text>
              {item.variants.map((variant, variantIndex) => (
                <Text key={variantIndex} style={styles.variantItem}>
                  • {variant.name} {variant.size} (+{formatCurrency(variant.extra, currency)})
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  itemsCard: {
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
  itemContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemQuantity: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  itemPrice: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  extrasContainer: {
    marginTop: 8,
  },
  extrasTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  extraItem: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  variantsContainer: {
    marginTop: 8,
  },
  variantsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  variantItem: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 8,
  },
});

export default OrderItemsCard;


