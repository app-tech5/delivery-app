import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global';
import UserAvatar from './UserAvatar';

export default function ProfileHeaderCard({
  imageUri,
  name,
  email,
  rating,
  isEditing,
  onChangePhoto,
}) {
  return (
    <View style={styles.container}>
      <UserAvatar
        uri={imageUri}
        name={name}
        editable={isEditing}
        onEditPress={onChangePhoto}
        style={styles.avatar}
      />

      <View style={styles.info}>
        <Text style={styles.name}>{name || 'Driver Name'}</Text>
        <Text style={styles.email}>{email || 'driver@example.com'}</Text>
        <View style={styles.ratingRow}>
          <Icon name="star" type="material" size={16} color={colors.warning} />
          <Text style={styles.rating}>{rating.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  avatar: {
    marginBottom: 16,
  },
  info: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.warning,
    marginLeft: 4,
  },
});
