import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { Card, Icon, Button, Avatar, Badge } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { driver, isAuthenticated, stats, logout } = useDriver();
  const { currency } = useSettings();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    phone: '',
    address: ''
  });

  // Données simulées pour les documents et véhicule (en production viendrait du backend)
  const mockVehicleData = {
    type: 'Scooter',
    model: 'Yamaha NMAX 125',
    licensePlate: 'AB-123-CD',
    insuranceExpiry: '2024-12-31'
  };

  const mockDocuments = [
    { id: 'license', name: 'Driver License', status: 'verified', expiry: '2025-06-15' },
    { id: 'insurance', name: 'Vehicle Insurance', status: 'verified', expiry: '2024-12-31' },
    { id: 'registration', name: 'Vehicle Registration', status: 'pending', expiry: null },
    { id: 'background', name: 'Background Check', status: 'verified', expiry: null }
  ];

  // Calculer les statistiques du profil
  const profileStats = {
    totalDeliveries: stats.completedOrders || 0,
    totalEarnings: stats.totalEarnings || 0,
    averageRating: stats.rating || 0,
    completionRate: stats.completedOrders && driver ? Math.round((stats.completedOrders / (stats.completedOrders + 5)) * 100) : 0, // Estimation
    memberSince: driver?.createdAt ? new Date(driver.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2024',
    lastActive: 'Today'
  };

  // Gestionnaire de déconnexion
  const handleLogout = () => {
    Alert.alert(
      i18n.t('navigation.logout'),
      i18n.t('common.confirmLogout'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('navigation.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  // Gestionnaire d'édition
  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      fullName: driver?.userId?.name || '',
      phone: driver?.userId?.phone || '',
      address: driver?.userId?.address || ''
    });
  };

  // Gestionnaire de sauvegarde
  const handleSave = () => {
    // Simulation de sauvegarde
    Alert.alert('Success', i18n.t('profile.updateSuccess'));
    setIsEditing(false);
  };

  // Gestionnaire d'annulation
  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      fullName: '',
      phone: '',
      address: ''
    });
  };

  // Obtenir la couleur du statut des documents
  const getDocumentStatusColor = (status) => {
    switch (status) {
      case 'verified': return colors.success;
      case 'pending': return colors.warning;
      case 'rejected': return colors.error;
      default: return colors.text.secondary;
    }
  };

  // Obtenir le label du statut des documents
  const getDocumentStatusLabel = (status) => {
    switch (status) {
      case 'verified': return i18n.t('profile.verified');
      case 'pending': return i18n.t('profile.pending');
      case 'rejected': return i18n.t('profile.rejected');
      default: return status;
    }
  };

  // Vérifier l'authentification
  if (!isAuthenticated || !driver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>{i18n.t('home.reconnect')}</Text>
          <Text style={styles.subtitle}>Please reconnect to view your profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('navigation.profile')}</Text>
        {!isEditing && (
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Icon name="edit" type="material" size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Section Photo et Infos de Base */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar
              size="xlarge"
              rounded
              source={driver?.userId?.image ? { uri: driver.userId.image } : null}
              title={driver?.userId?.name?.charAt(0)?.toUpperCase() || 'D'}
              containerStyle={styles.avatar}
            />
            {isEditing && (
              <TouchableOpacity style={styles.changePhotoButton}>
                <Icon name="camera" type="material" size={16} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.basicInfo}>
            <Text style={styles.driverName}>
              {driver?.userId?.name || 'Driver Name'}
            </Text>
            <Text style={styles.driverEmail}>
              {driver?.userId?.email || 'driver@example.com'}
            </Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" type="material" size={16} color={colors.warning} />
              <Text style={styles.ratingText}>
                {profileStats.averageRating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>{i18n.t('profile.statistics')}</Text>

          <View style={styles.statsGrid}>
            <Card containerStyle={[styles.statCard, styles.deliveriesCard]}>
              <Text style={styles.statValue}>{profileStats.totalDeliveries}</Text>
              <Text style={styles.statLabel}>{i18n.t('profile.totalDeliveries')}</Text>
            </Card>

            <Card containerStyle={[styles.statCard, styles.earningsCard]}>
              <Text style={styles.statValue}>
                {profileStats.totalEarnings.toFixed(2)}{currency?.symbol || '€'}
              </Text>
              <Text style={styles.statLabel}>{i18n.t('profile.totalEarnings')}</Text>
            </Card>

            <Card containerStyle={[styles.statCard, styles.ratingCard]}>
              <Text style={styles.statValue}>{profileStats.averageRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>{i18n.t('profile.averageRating')}</Text>
            </Card>

            <Card containerStyle={[styles.statCard, styles.completionCard]}>
              <Text style={styles.statValue}>{profileStats.completionRate}%</Text>
              <Text style={styles.statLabel}>{i18n.t('profile.completionRate')}</Text>
            </Card>
          </View>
        </View>

        {/* Informations Personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('profile.personalInfo')}</Text>

          <Card containerStyle={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{i18n.t('profile.fullName')}</Text>
              <Text style={styles.infoValue}>
                {driver?.userId?.name || 'Not provided'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{i18n.t('profile.email')}</Text>
              <Text style={styles.infoValue}>
                {driver?.userId?.email || 'Not provided'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{i18n.t('profile.phone')}</Text>
              <Text style={styles.infoValue}>
                {driver?.userId?.phone || 'Not provided'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{i18n.t('profile.address')}</Text>
              <Text style={styles.infoValue}>
                {driver?.userId?.address || 'Not provided'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{i18n.t('profile.memberSince')}</Text>
              <Text style={styles.infoValue}>{profileStats.memberSince}</Text>
            </View>
          </Card>
        </View>

        {/* Informations Véhicule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('profile.vehicleInfo')}</Text>

          <Card containerStyle={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{i18n.t('profile.vehicleType')}</Text>
              <Text style={styles.infoValue}>{mockVehicleData.type}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{i18n.t('profile.vehicleModel')}</Text>
              <Text style={styles.infoValue}>{mockVehicleData.model}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{i18n.t('profile.licensePlate')}</Text>
              <Text style={styles.infoValue}>{mockVehicleData.licensePlate}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{i18n.t('profile.insuranceExpiry')}</Text>
              <Text style={styles.infoValue}>
                {new Date(mockVehicleData.insuranceExpiry).toLocaleDateString('en-US')}
              </Text>
            </View>
          </Card>
        </View>

        {/* Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('profile.documents')}</Text>

          {mockDocuments.map((doc) => (
            <Card key={doc.id} containerStyle={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  {doc.expiry && (
                    <Text style={styles.documentExpiry}>
                      Expires: {new Date(doc.expiry).toLocaleDateString('en-US')}
                    </Text>
                  )}
                </View>

                <Badge
                  value={getDocumentStatusLabel(doc.status)}
                  status={doc.status === 'verified' ? 'success' : doc.status === 'pending' ? 'warning' : 'error'}
                  containerStyle={styles.documentBadge}
                />
              </View>

              {doc.status !== 'verified' && (
                <Button
                  title={i18n.t('profile.uploadDocument')}
                  buttonStyle={styles.uploadButton}
                  titleStyle={styles.uploadButtonText}
                  icon={
                    <Icon
                      name="upload"
                      type="material"
                      size={16}
                      color={colors.primary}
                      style={{ marginRight: 8 }}
                    />
                  }
                />
              )}
            </Card>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title={i18n.t('profile.changePassword')}
            buttonStyle={styles.secondaryButton}
            titleStyle={styles.secondaryButtonText}
            icon={
              <Icon
                name="lock"
                type="material"
                size={16}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
            }
          />

          <Button
            title={i18n.t('navigation.logout')}
            buttonStyle={styles.logoutButton}
            titleStyle={styles.logoutButtonText}
            onPress={handleLogout}
            icon={
              <Icon
                name="logout"
                type="material"
                size={16}
                color={colors.error}
                style={{ marginRight: 8 }}
              />
            }
          />
        </View>

        {/* Boutons d'édition */}
        {isEditing && (
          <View style={styles.editActions}>
            <Button
              title={i18n.t('common.cancel')}
              buttonStyle={styles.cancelButton}
              onPress={handleCancel}
            />
            <Button
              title={i18n.t('profile.saveChanges')}
              buttonStyle={styles.saveButton}
              onPress={handleSave}
            />
          </View>
        )}

        {/* Espace en bas pour le scroll */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  editButton: {
    padding: 8,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },

  // Profile header
  profileHeader: {
    backgroundColor: colors.white,
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    borderWidth: 4,
    borderColor: colors.primary,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  basicInfo: {
    alignItems: 'center',
  },
  driverName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  driverEmail: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.warning,
    marginLeft: 4,
  },

  // Stats section
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 0,
  },

  // Stat card colors
  deliveriesCard: {
    backgroundColor: colors.primary,
  },
  earningsCard: {
    backgroundColor: colors.success,
  },
  ratingCard: {
    backgroundColor: colors.warning,
  },
  completionCard: {
    backgroundColor: colors.info,
  },

  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
  },

  // Sections
  section: {
    padding: 16,
  },

  // Info cards
  infoCard: {
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 2,
    textAlign: 'right',
  },

  // Document cards
  documentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  documentExpiry: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  documentBadge: {
    marginTop: -4,
  },
  uploadButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  uploadButtonText: {
    color: colors.primary,
  },

  // Actions section
  actionsSection: {
    padding: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutButtonText: {
    color: colors.error,
  },

  // Edit actions
  editActions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
  },
  cancelButton: {
    backgroundColor: colors.text.secondary,
    marginRight: 8,
    flex: 1,
  },
  saveButton: {
    backgroundColor: colors.primary,
    flex: 1,
  },

  // Bottom spacer
  bottomSpacer: {
    height: 20,
  },
});