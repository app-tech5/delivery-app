import * as ImagePicker from 'expo-image-picker';
import i18n from '../i18n';

export async function pickImageFromLibrary() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error(i18n.t('profile.uploadError'));
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (result.canceled) return null;
  return result.assets[0];
}
