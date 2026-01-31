import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../global';

const ScreenHeader = ({
  title,
  subtitle,
  titleStyle,
  subtitleStyle,
  containerStyle
}) => {
  return (
    <View style={[styles.header, containerStyle]}>
      <Text style={[styles.headerTitle, titleStyle]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.headerSubtitle, subtitleStyle]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
});

export default ScreenHeader;
