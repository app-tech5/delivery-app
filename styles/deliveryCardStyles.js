import { StyleSheet } from 'react-native';
import { colors } from '../global';

export const deliveryCardStyles = StyleSheet.create({
  
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
  amountLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 2,
    textAlign: 'right',
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
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  actionButtonContainer: {
    flex: 1,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  actionButtonTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    includeFontPadding: false,
    lineHeight: 18,
  },
  actionIconContainer: {
    marginRight: 0,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  startButton: {
    backgroundColor: colors.info,
  },
  deliveredButton: {
    backgroundColor: colors.primary,
  },
  outForDeliveryButton: {
    backgroundColor: colors.rating,
  },
  detailsButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  detailsButtonTitle: {
    color: colors.primary,
  },
  
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

