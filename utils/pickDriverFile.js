import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import i18n from '../i18n';

async function pickImage() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error(i18n.t('profile.uploadError'));
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    mimeType: asset.mimeType || 'image/jpeg',
    fileName: asset.fileName || 'upload.jpg',
  };
}

async function pickPdf() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const file = result.assets[0];
  return {
    uri: file.uri,
    mimeType: file.mimeType || 'application/pdf',
    fileName: file.name || 'document.pdf',
  };
}

export function pickDriverDocument() {
  return new Promise((resolve, reject) => {
    Alert.alert(i18n.t('profile.uploadDocument'), null, [
      { text: i18n.t('profile.cancel'), style: 'cancel', onPress: () => resolve(null) },
      {
        text: i18n.t('profile.pickImage'),
        onPress: () => pickImage().then(resolve).catch(reject),
      },
      {
        text: i18n.t('profile.pickPdf'),
        onPress: () => pickPdf().then(resolve).catch(reject),
      },
    ]);
  });
}
