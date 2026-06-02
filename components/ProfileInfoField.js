import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { colors } from '../global';

export default function ProfileInfoField({
  label,
  value,
  fieldKey,
  isEditing,
  readOnly = false,
  editValue,
  onChangeText,
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {isEditing && !readOnly ? (
        <TextInput
          style={styles.input}
          value={editValue}
          onChangeText={(text) => onChangeText(fieldKey, text)}
        />
      ) : (
        <Text style={styles.value}>{value || 'Not provided'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 2,
    textAlign: 'right',
  },
  input: {
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
});
