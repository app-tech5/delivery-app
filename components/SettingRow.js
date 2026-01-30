import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global';

export default function SettingRow({
  title,
  subtitle,
  value,
  onPress,
  showChevron = false,
  switchProps,
  icon,
  iconType = 'material',
  iconColor = colors.primary,
  disabled = false,
  danger = false
}) {
  const renderRightElement = () => {
    if (switchProps) {
      return (
        <Switch
          {...switchProps}
          trackColor={{ false: colors.background.secondary, true: colors.primary }}
          thumbColor={switchProps.value ? colors.white : colors.text.secondary}
        />
      );
    }

    if (value) {
      return <Text style={styles.value}>{value}</Text>;
    }

    if (showChevron) {
      return (
        <Icon
          name="chevron-right"
          type="material"
          size={24}
          color={danger ? colors.error : colors.text.secondary}
        />
      );
    }

    return null;
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.leftContent}>
        {icon && (
          <View style={styles.iconContainer}>
            <Icon
              name={icon}
              type={iconType}
              size={20}
              color={iconColor}
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, danger && styles.dangerTitle]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, danger && styles.dangerSubtitle]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {renderRightElement()}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  disabled: {
    opacity: 0.5,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  dangerTitle: {
    color: colors.error,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  dangerSubtitle: {
    color: colors.error,
  },
  value: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});
