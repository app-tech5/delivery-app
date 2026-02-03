import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../global';

const ScreenHeader = ({
  title,
  subtitle,
  titleStyle,
  subtitleStyle,
  containerStyle,
  leftComponent,
  rightComponent,
  titleAccessory,
  children,
  contentStyle
}) => {
  return (
    <View style={[styles.header, containerStyle]}>
      <View style={styles.topRow}>
        {leftComponent ? (
          <View style={styles.left}>
            {leftComponent}
          </View>
        ) : null}

        <View style={[styles.content, contentStyle]}>
          {!!title && (
            <View style={styles.titleLine}>
              <Text style={[styles.headerTitle, titleStyle]}>{title}</Text>
              {titleAccessory ? (
                <View style={styles.titleAccessory}>
                  {titleAccessory}
                </View>
              ) : null}
            </View>
          )}
          {subtitle ? (
            <Text style={[styles.headerSubtitle, subtitleStyle]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightComponent ? (
          <View style={styles.right}>
            {rightComponent}
          </View>
        ) : null}
      </View>

      {children ? (
        <View style={styles.childrenContainer}>
          {children}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 30,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    marginRight: 12,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  right: {
    marginLeft: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  titleAccessory: {
    marginLeft: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  childrenContainer: {
    marginTop: 12,
  },
});

export default ScreenHeader;
