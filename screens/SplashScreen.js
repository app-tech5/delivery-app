import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../global';
import { ScreenHeader } from '../components';

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.container1}>
        <Animatable.View
          animation="bounceIn"
          duration={1500}
          style={styles.logoContainer}
        >
          <Icon
            name="local-shipping"
            type="material"
            size={120}
            color={colors.primary}
            containerStyle={styles.iconContainer}
          />
          <ScreenHeader
            title="Good Food Driver"
            subtitle="Livraison rapide & fiable"
            containerStyle={styles.screenHeader}
            contentStyle={styles.screenHeaderContent}
            titleStyle={styles.appName}
            subtitleStyle={styles.tagline}
          />
        </Animatable.View>
      </View>

      <Animatable.View style={styles.container2} animation="fadeInUpBig">
        <View style={styles.button}>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <LinearGradient
              colors={colors.auth.gradient2}
              style={styles.signInButton}
            >
              <Text style={styles.signInText}>Commencer</Text>
              <Icon
                name="navigate-next"
                type="material"
                size={20}
                color={colors.primary}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.auth.background,
  },
  container1: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  screenHeader: {
    backgroundColor: 'transparent',
    padding: 0,
    paddingTop: 0,
  },
  screenHeaderContent: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 1,
  },
  container2: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  signInText: {
    fontWeight: "bold",
    color: colors.primary,
  },
  signInButton: {
    width: 180,
    height: 50,
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 25,
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  button: {
    alignItems: "flex-end",
    marginTop: 80,
    marginRight: 20,
  }
});
