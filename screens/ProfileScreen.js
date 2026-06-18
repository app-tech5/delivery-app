import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { useProfileEdit } from '../hooks/useProfileEdit';
import { useProfileDocuments } from '../hooks/useProfileDocuments';
import { buildProfileStats } from '../utils/profileUtils';
import { buildDriverDocuments } from '../utils/documentUtils';
import {
  ScreenLayout,
  ReconnectMessage,
  ProfileHeaderCard,
  ProfileStatsGrid,
  ProfileInfoCard,
  ProfileVehicleDetailsLink,
  ProfileDocumentsCard,
  ProfileActionsSection,
  ProfileEditButton,
  ProfileCancelButton,
  ProfileSaveButton,
  confirmLogout,
} from '../components';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { driver, isAuthenticated, stats, logout, setDriver } = useDriver();
  const { currency } = useSettings();

  const {
    isEditing,
    saving,
    editData,
    displayImage,
    startEdit,
    cancelEdit,
    updateField,
    changePhoto,
    save,
  } = useProfileEdit(driver, setDriver);

  const {
    uploadingDocType,
    customDocType,
    setCustomDocType,
    uploadDocument,
  } = useProfileDocuments(driver, setDriver);

  if (!isAuthenticated || !driver) {
    return <ReconnectMessage message="Please reconnect to view your profile" />;
  }

  const profileStats = buildProfileStats(driver, stats);
  const vehicle = driver?.vehicle || {};
  const documents = buildDriverDocuments(driver);

  const personalFields = [
    { label: i18n.t('profile.fullName'), value: driver?.userId?.name, fieldKey: 'fullName' },
    { label: i18n.t('profile.email'), value: driver?.userId?.email, fieldKey: 'email', readOnly: true },
    { label: i18n.t('profile.phone'), value: driver?.userId?.phone, fieldKey: 'phone' },
    { label: i18n.t('profile.address'), value: driver?.userId?.address, fieldKey: 'address' },
  ];

  const vehicleFields = [
    { label: i18n.t('profile.licenseNumber'), value: driver?.licenseNumber, fieldKey: 'licenseNumber' },
    { label: i18n.t('profile.vehicleType'), value: vehicle.type, fieldKey: 'vehicleType' },
    { label: i18n.t('profile.vehicleModel'), value: vehicle.model, fieldKey: 'vehicleModel' },
    { label: i18n.t('profile.licensePlate'), value: vehicle.licensePlate, fieldKey: 'licensePlate' },
  ];

  return (
    <ScreenLayout
      title={i18n.t('navigation.profile')}
      leftComponent={isEditing ? <ProfileCancelButton onPress={cancelEdit} /> : null}
      rightComponent={
        isEditing ? (
          <ProfileSaveButton onPress={save} saving={saving} />
        ) : (
          <ProfileEditButton onPress={startEdit} />
        )
      }
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ProfileHeaderCard
          imageUri={displayImage}
          name={driver?.userId?.name}
          email={driver?.userId?.email}
          rating={profileStats.averageRating}
          isEditing={isEditing}
          onChangePhoto={changePhoto}
        />

        <ProfileStatsGrid stats={profileStats} currencySymbol={currency?.symbol || '€'} />

        <ProfileInfoCard
          title={i18n.t('profile.personalInfo')}
          fields={personalFields}
          isEditing={isEditing}
          editData={editData}
          onFieldChange={updateField}
          footer={(
            <View style={styles.memberSinceRow}>
              <Text style={styles.memberSinceLabel}>{i18n.t('profile.memberSince')}</Text>
              <Text style={styles.memberSinceValue}>{profileStats.memberSince}</Text>
            </View>
          )}
        />

        <ProfileInfoCard
          title={i18n.t('profile.vehicleInfo')}
          fields={vehicleFields}
          isEditing={isEditing}
          editData={editData}
          onFieldChange={updateField}
          footer={
            !isEditing ? (
              <ProfileVehicleDetailsLink
                label={i18n.t('profile.viewVehicleDetails')}
                onPress={() => navigation.navigate('VehicleDetails')}
              />
            ) : null
          }
        />

        <ProfileDocumentsCard
          documents={documents}
          uploadingDocType={uploadingDocType}
          customDocType={customDocType}
          onCustomDocTypeChange={setCustomDocType}
          onUpload={uploadDocument}
        />

        <ProfileActionsSection onLogout={() => confirmLogout(logout)} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  memberSinceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  memberSinceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  memberSinceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 2,
    textAlign: 'right',
  },
  bottomSpacer: {
    height: 20,
  },
});
