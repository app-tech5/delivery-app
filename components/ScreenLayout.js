import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from './ScreenHeader';
import { colors } from '../global';

const ScreenLayout = ({
  title,
  subtitle,
  titleStyle,
  subtitleStyle,
  contentStyle,
  leftComponent,
  rightComponent,
  titleAccessory,
  headerContainerStyle,
  headerChildren,
  children,
  statusBarStyle = 'light-content',
  testID = 'screen-layout',
}) => {
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Math.max(insets.top, 12) + 8;

  return (
    <SafeAreaView
      style={styles.container}
      edges={['left', 'right', 'bottom']}
      testID={`${testID}-safe-area`}
    >
      <StatusBar backgroundColor={colors.primary} barStyle={statusBarStyle} />
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        titleStyle={titleStyle}
        subtitleStyle={subtitleStyle}
        contentStyle={contentStyle}
        leftComponent={leftComponent}
        rightComponent={rightComponent}
        titleAccessory={titleAccessory}
        containerStyle={[{ paddingTop: headerPaddingTop }, headerContainerStyle]}
      >
        {headerChildren}
      </ScreenHeader>
      <View style={styles.content} testID={`${testID}-content`}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
  },
});

export default ScreenLayout;
