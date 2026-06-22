import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { colors } from '../global';
import i18n from '../i18n';

const HamburgerButton = ({ color = colors.white, testID = 'hamburger-button' }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (typeof navigation.openDrawer === 'function') {
      navigation.openDrawer();
      return;
    }
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <TouchableOpacity
      testID={testID}
      onPress={handlePress}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={i18n.t('navigation.openMenu')}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icon name="menu" type="material" size={28} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});

export default HamburgerButton;
