import { useState } from 'react';
import { Alert } from 'react-native';
import apiClient from '../api';
import { PUBLIC_UPLOAD_FOLDERS } from '../config';
import i18n from '../i18n';
import { pickImageFromLibrary } from '../utils/pickImage';
import {
  buildProfileEditData,
  mergeDriverWithUser,
  EMPTY_PROFILE_EDIT_DATA,
} from '../utils/profileUtils';

export function useProfileEdit(driver, setDriver) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState(EMPTY_PROFILE_EDIT_DATA);

  const startEdit = () => {
    setEditData(buildProfileEditData(driver));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditData(EMPTY_PROFILE_EDIT_DATA);
  };

  const updateField = (fieldKey, value) => {
    setEditData((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const changePhoto = async () => {
    try {
      const asset = await pickImageFromLibrary();
      if (!asset) return;

      setEditData((prev) => ({ ...prev, image: asset.uri }));

      const url = await apiClient.uploadPublicFile(asset, PUBLIC_UPLOAD_FOLDERS.AVATARS);
      setEditData((prev) => ({ ...prev, image: url }));
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert(i18n.t('profile.uploadError'));
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      let imageToSave = editData.image;
      if (
        imageToSave?.startsWith('file://') ||
        imageToSave?.startsWith('content://')
      ) {
        imageToSave = await apiClient.uploadPublicFile(
          {
            uri: imageToSave,
            mimeType: 'image/jpeg',
            fileName: 'upload.jpg',
          },
          PUBLIC_UPLOAD_FOLDERS.AVATARS
        );
      }

      const updatedUser = await apiClient.updateUser({
        name: editData.fullName,
        phone: editData.phone,
        address: editData.address,
        image: imageToSave,
      });

      const updatedDriver = await apiClient.updateDriverProfile({
        licenseNumber: editData.licenseNumber,
        vehicle: {
          type: editData.vehicleType,
          model: editData.vehicleModel,
          licensePlate: editData.licensePlate,
        },
      });

      const mergedDriver = mergeDriverWithUser(updatedDriver, updatedUser);
      apiClient.driver = mergedDriver;
      await apiClient.saveDriverToStorage();
      setDriver(mergedDriver);
      setIsEditing(false);
      setEditData(EMPTY_PROFILE_EDIT_DATA);
      Alert.alert(i18n.t('profile.updateSuccess'));
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert(i18n.t('profile.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const displayImage = isEditing
    ? (editData.image || driver?.userId?.image)
    : driver?.userId?.image;

  return {
    isEditing,
    saving,
    editData,
    displayImage,
    startEdit,
    cancelEdit,
    updateField,
    changePhoto,
    save,
  };
}
