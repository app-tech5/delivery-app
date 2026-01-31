import { StyleSheet } from 'react-native';
import { colors } from '../global';

/**
 * Styles partagés pour les composants timeline
 * Utilisables dans HistoryScreen, OrderHistory, etc.
 */
export const timelineStyles = StyleSheet.create({
  // Container principal de la timeline
  container: {
    paddingHorizontal: 16,
  },

  // Élément de livraison dans la timeline
  deliveryItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  // Connecteur timeline (point + ligne verticale)
  timelineConnector: {
    alignItems: 'center',
    width: 20,
    marginRight: 12,
  },

  // Point de la timeline
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 16,
  },

  // Ligne verticale de la timeline
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.background.secondary,
    marginTop: 8,
  },

  // Carte de livraison
  deliveryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },

  // Header de la carte de livraison
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  // Infos de livraison (gauche)
  deliveryInfo: {
    flex: 1,
  },

  // ID de commande
  deliveryId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 2,
  },

  // Heure de livraison
  deliveryTime: {
    fontSize: 12,
    color: colors.text.secondary,
  },

  // Montant (droite)
  deliveryAmount: {
    alignItems: 'flex-end',
  },

  // Valeur du montant
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 4,
  },

  // Chip de statut
  statusChip: {
    height: 35,
    backgroundColor: colors.success,
    borderRadius: 10,
  },

  // Texte du chip de statut
  statusChipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Détails de la livraison
  deliveryDetails: {
    marginTop: 8,
  },

  // Adresse de livraison
  deliveryAddress: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },

  // Info client
  customerInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },

  // Info restaurant
  restaurantInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
    fontWeight: '500',
  },

  // Section montant
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  // Label du montant
  amountLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },

  // Bouton livrer
  deliverButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: 10,
  },

  // Actions de livraison
  deliveryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  // En-tête de groupe de dates
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },

  // Ligne de séparation
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.background.secondary,
  },

  // Contenu de l'en-tête de date
  dateContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  // Texte de la date
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },

  // Stats de la date
  dateStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Nombre de livraisons
  dateDeliveries: {
    fontSize: 12,
    color: colors.text.secondary,
    marginRight: 12,
  },

  // Gains de la date
  dateEarnings: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
});
