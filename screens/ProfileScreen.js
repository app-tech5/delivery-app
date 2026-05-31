import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Icon, Button, Avatar } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../global';
import i18n from '../i18n';
import { DOCUMENT_TYPES } from '../config';
import apiClient from '../api';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader, ReconnectMessage } from '../components';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { driver, isAuthenticated, stats, logout, setDriver } = useDriver();
  const { currency } = useSettings();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState(null);
  const [customDocType, setCustomDocType] = useState('');
  const [editData, setEditData] = useState({
    fullName: '',
    phone: '',
    address: '',
    image: '',
    licenseNumber: '',
    vehicleType: '',
    vehicleModel: '',
    licensePlate: '',
  });

  const vehicle = driver?.vehicle || {};

  const getDocumentLabel = (type) =>
    i18n.t(type, { defaultValue: type.replace(/_/g, ' ') });

  const normalizeDocType = (value) =>
    value.trim().toLowerCase().replace(/\s+/g, '_');

  const uploadedTypes = (driver?.documents || []).map((doc) => doc.type);
  const documentTypes = [...new Set([...DOCUMENT_TYPES, ...uploadedTypes])];

  const driverDocuments = documentTypes.map((type) => {
    const uploaded = (driver?.documents || []).find((doc) => doc.type === type);
    return {
      type,
      fileUrl: uploaded?.fileUrl,
      canUpload: DOCUMENT_TYPES.includes(type),
      status: uploaded?.fileUrl
        ? (driver?.isApproved ? 'verified' : 'pending')
        : null,
    };
  });

  const pickAndUploadDocument = async (rawDocType) => {
    const docType = normalizeDocType(rawDocType);

    if (!docType) {
      Alert.alert(i18n.t('profile.documentTypeRequired'));
      return;
    }

    if ((driver?.documents || []).some((doc) => doc.type === docType)) {
      Alert.alert(i18n.t('profile.documentAlreadyAdded'));
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(i18n.t('profile.uploadError'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    setUploadingDocType(docType);
    try {
      const updatedDriver = await apiClient.uploadDriverDocument(
        docType,
        result.assets[0]
      );
      setDriver(updatedDriver);
      setCustomDocType('');
      Alert.alert(i18n.t('profile.uploadSuccess'));
    } catch (error) {
      console.error('Document upload error:', error);
      Alert.alert(
        error.message === 'Document already added'
          ? i18n.t('profile.documentAlreadyAdded')
          : i18n.t('profile.uploadError')
      );
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleUploadDocument = (docType) => pickAndUploadDocument(docType);

  // Navigation vers les détails du véhicule
  const navigateToVehicleDetails = () => {
    navigation.navigate('VehicleDetails');
  };

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
      address: driver?.userId?.address || '',
      image: driver?.userId?.image || '',
      licenseNumber: driver?.licenseNumber || '',
      vehicleType: vehicle.type || '',
      vehicleModel: vehicle.model || '',
      licensePlate: vehicle.licensePlate || '',
    });
  };

  const handleChangePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(i18n.t('profile.uploadError'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    try {
      const url = await apiClient.uploadFile(result.assets[0]);
      setEditData((prev) => ({ ...prev, image: url }));
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert(i18n.t('profile.uploadError'));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.updateUser({
        name: editData.fullName,
        phone: editData.phone,
        address: editData.address,
        image: editData.image,
      });
      const updatedDriver = await apiClient.updateDriverProfile({
        licenseNumber: editData.licenseNumber,
        vehicle: {
          type: editData.vehicleType,
          model: editData.vehicleModel,
          licensePlate: editData.licensePlate,
        },
      });
      setDriver(updatedDriver);
      setIsEditing(false);
      Alert.alert(i18n.t('profile.updateSuccess'));
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert(i18n.t('profile.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const renderField = (label, value, fieldKey, readOnly = false) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {isEditing && !readOnly ? (
        <TextInput
          style={styles.editInput}
          value={editData[fieldKey]}
          onChangeText={(text) => setEditData((prev) => ({ ...prev, [fieldKey]: text }))}
        />
      ) : (
        <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
      )}
    </View>
  );

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
    return <ReconnectMessage message="Please reconnect to view your profile" />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScreenHeader
        title={i18n.t('navigation.profile')}
        containerStyle={{ paddingTop: Math.max(insets.top, 12) + 8 }}
        leftComponent={isEditing ? (
          <TouchableOpacity onPress={handleCancel} style={styles.headerAction}>
            <Text style={styles.headerActionText}>{i18n.t('common.cancel')}</Text>
          </TouchableOpacity>
        ) : null}
        rightComponent={isEditing ? (
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={styles.headerAction}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.headerActionText}>{i18n.t('common.save')}</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Icon name="edit" type="material" size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Section Photo et Infos de Base */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar
              size="xlarge"
              rounded
              source={(isEditing && editData.image) || driver?.userId?.image
                ? { uri: (isEditing && editData.image) || driver?.userId?.image }
                : null}
              title={driver?.userId?.name?.charAt(0)?.toUpperCase() || 'D'}
              containerStyle={styles.avatar}
            />
            {isEditing && (
              <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangePhoto}>
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
            {renderField(i18n.t('profile.fullName'), driver?.userId?.name, 'fullName')}
            {renderField(i18n.t('profile.email'), driver?.userId?.email, 'email', true)}
            {renderField(i18n.t('profile.phone'), driver?.userId?.phone, 'phone')}
            {renderField(i18n.t('profile.address'), driver?.userId?.address, 'address')}

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
            {renderField(i18n.t('profile.licenseNumber'), driver?.licenseNumber, 'licenseNumber')}
            {renderField(i18n.t('profile.vehicleType'), vehicle.type, 'vehicleType')}
            {renderField(i18n.t('profile.vehicleModel'), vehicle.model, 'vehicleModel')}
            {renderField(i18n.t('profile.licensePlate'), vehicle.licensePlate, 'licensePlate')}

            {!isEditing && (
              <TouchableOpacity
                style={styles.vehicleDetailsButton}
                onPress={navigateToVehicleDetails}
              >
                <MaterialIcons name="expand-more" size={20} color={colors.primary} />
                <Text style={styles.vehicleDetailsText}>{i18n.t('profile.viewVehicleDetails')}</Text>
              </TouchableOpacity>
            )}
          </Card>
        </View>

        {/* Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('profile.documents')}</Text>

          <Card containerStyle={styles.infoCard}>
            {driverDocuments.map((doc) => (
              <View key={doc.type} style={styles.documentRow}>
                <View style={styles.documentInfo}>
                  <Text style={styles.infoLabel}>{getDocumentLabel(doc.type)}</Text>
                  {doc.fileUrl && (
                    <TouchableOpacity onPress={() => Linking.openURL(doc.fileUrl)}>
                      <Text style={styles.documentLink}>{i18n.t('viewDocument')}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {doc.status ? (
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: `${getDocumentStatusColor(doc.status)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: getDocumentStatusColor(doc.status) },
                      ]}
                    >
                      {getDocumentStatusLabel(doc.status)}
                    </Text>
                  </View>
                ) : doc.canUpload ? (
                  <TouchableOpacity
                    style={styles.uploadAction}
                    onPress={() => handleUploadDocument(doc.type)}
                    disabled={!!uploadingDocType}
                  >
                    {uploadingDocType === doc.type ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <MaterialIcons name="cloud-upload" size={18} color={colors.primary} />
                        <Text style={styles.uploadActionText}>
                          {i18n.t('profile.uploadDocument')}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}

            <View style={[styles.documentRow, styles.documentRowLast, styles.customDocRow]}>
              <TextInput
                style={styles.customDocInput}
                placeholder={i18n.t('profile.documentTypePlaceholder')}
                placeholderTextColor={colors.text.secondary}
                value={customDocType}
                onChangeText={setCustomDocType}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.uploadAction}
                onPress={() => pickAndUploadDocument(customDocType)}
                disabled={!!uploadingDocType || !customDocType.trim()}
              >
                {uploadingDocType === normalizeDocType(customDocType) ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <MaterialIcons name="cloud-upload" size={18} color={colors.primary} />
                    <Text style={styles.uploadActionText}>
                      {i18n.t('profile.uploadDocument')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Card>
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
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerAction: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  headerActionText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
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
  editInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: colors.text.primary,
    textAlign: 'right',
    backgroundColor: colors.background.secondary,
  },

  // Documents
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  documentRowLast: {
    borderBottomWidth: 0,
  },
  documentInfo: {
    flex: 1,
    marginRight: 12,
  },
  documentLink: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  uploadAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  uploadActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  customDocRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  customDocInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
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

  // Vehicle details button
  vehicleDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
  },
  vehicleDetailsText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 8,
  },

  // Bottom spacer
  bottomSpacer: {
    height: 20,
  },
});