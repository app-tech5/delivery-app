import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../global';
import ProfileInfoField from './ProfileInfoField';

export default function ProfileInfoCard({
  title,
  fields,
  isEditing,
  editData,
  onFieldChange,
  footer,
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <Card containerStyle={styles.card}>
        {fields.map((field) => (
          <ProfileInfoField
            key={field.fieldKey}
            label={field.label}
            value={field.value}
            fieldKey={field.fieldKey}
            isEditing={isEditing}
            readOnly={field.readOnly}
            editValue={editData[field.fieldKey]}
            onChangeText={onFieldChange}
          />
        ))}
        {footer}
      </Card>
    </View>
  );
}

export function ProfileVehicleDetailsLink({ label, onPress }) {
  return (
    <TouchableOpacity style={linkStyles.button} onPress={onPress}>
      <MaterialIcons name="expand-more" size={20} color={colors.primary} />
      <Text style={linkStyles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
});

const linkStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 8,
  },
});
