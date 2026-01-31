import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global';

const EmptyState = ({
  icon,
  iconType = 'material',
  title,
  subtitle,
  iconSize = 64,
  containerStyle,
  titleStyle,
  subtitleStyle,
  iconStyle
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Icon
        name={icon}
        type={iconType}
        size={iconSize}
        color={colors.text.secondary}
        containerStyle={iconStyle}
      />
      <Text style={[styles.title, titleStyle]}>
        {title}
      </Text>
      <Text style={[styles.subtitle, subtitleStyle]}>
        {subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EmptyState;
