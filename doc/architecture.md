# Architecture — Good Food Pro Driver

## Stack

- Expo ~54 / React Native 0.81 / React 19
- React Navigation (drawer + stacks)
- Contexts: `DriverContext`, `OrdersContext`, `SettingContext`
- MapLibre, expo-location (+ background task)
- socket.io-client
- i18n-js (EN / FR)

## Entry & navigation

- `App.js` → providers → `navigation/AppNavigator.js`
- Authenticated shell: `DrawerNavigator` (`Home`, `Deliveries`, `Earnings`, …)
- Auth screens: Splash / Login / SignUp / DriverOnboarding

## Data

- REST via `api.js` against Good Food Pro backend
- Demo merges in `api/demo/` when `EXPO_PUBLIC_DEMO_MODE=true`
- Local cache helpers under `utils/`

## Scripts

```bash
npm run android   # first-time / native: install development build
npm run ios
npm start         # Metro only (dev client must already be installed)
npm test
npm run lint
npm run smoke
npm run test:hermes:smoke
```

**Not Expo Go** — requires `expo-dev-client` (see root README).

Optional EAS: `eas.json` (bring your own Expo account).

Hermes CDP login→home is run locally with `adb` + Metro against the buyer’s own API URL in `.env`.
