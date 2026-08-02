# Architecture — Good Food Pro Driver

## Stack

- Expo ~54 / React Native 0.81 / React 19
- React Navigation (drawer + nested stacks)
- Contexts: `DriverContext`, `SettingContext`
- MapLibre (`@maplibre/maplibre-react-native`), expo-location (+ background task)
- socket.io-client
- expo-dev-client
- i18n-js (EN / FR)

## Entry & navigation

- `App.js` → providers → `navigation/AppNavigator.js`
- Authenticated shell: `DrawerNavigator`
  - Home, Deliveries → DeliveryDetails, Earnings, Transactions, History, Reports
  - Notifications, Support, Profile → VehicleDetails, OrderDetails (hidden drawer item)
  - Settings → PaymentMethods
- Auth screens: Splash / Login / SignUp / DriverOnboarding

## Data

- REST via root `api.js` against Good Food Pro backend
- Demo merges in `api/demo/` when `EXPO_PUBLIC_DEMO_MODE=true`
- Local cache helpers under `utils/`

## Scripts

```bash
npm run android   # first-time / native: install development build
npm run ios
npm start         # Metro only (dev client must already be installed)
npm test
npm run lint
npm run smoke     # local: Node 20+, npm ci, Expo config, JS export (no live domain)
```

**Not Expo Go** — requires `expo-dev-client` (see root README).

Optional EAS: `eas.json` (bring your own Expo account).
