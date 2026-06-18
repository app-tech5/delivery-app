import { StyleSheet } from 'react-native';
import { colors } from '../global';

export const timelineStyles = StyleSheet.create({
  
  container: {
    paddingHorizontal: 16,
  },
  
  deliveryItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  
  timelineConnector: {
    alignItems: 'center',
    width: 20,
    marginRight: 12,
  },
  
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 16,
  },
  
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.background.secondary,
    marginTop: 8,
  },
  
  deliveryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  deliveryInfo: {
    flex: 1,
  },
  
  deliveryId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 2,
  },
  
  deliveryTime: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  
  deliveryAmount: {
    alignItems: 'flex-end',
  },
  
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 4,
  },
  
  statusChip: {
    height: 35,
    backgroundColor: colors.success,
    borderRadius: 10,
  },
  
  statusChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  deliveryDetails: {
    marginTop: 8,
  },
  
  deliveryAddress: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  
  customerInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  
  restaurantInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  
  amountLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  
  deliverButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: 10,
  },
  
  deliveryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.background.secondary,
  },
  
  dateContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  
  dateStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  dateDeliveries: {
    fontSize: 12,
    color: colors.text.secondary,
    marginRight: 12,
  },
  
  dateEarnings: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
});

