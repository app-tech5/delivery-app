# API layer – delivery-app (driver)

HTTP client in root `api.js` (+ `api/demo/` for demo-mode merges). Base URL: `config.API_BASE_URL` from `EXPO_PUBLIC_API_URL`.

Compact list: [docs/endpoints.md](docs/endpoints.md).

## Architecture

| File | Role |
|------|------|
| **api.js** | Singleton client: token/driver/user, `apiCall()`, auth, orders, payments, settings, notifications, Stripe Connect, uploads |
| **config.js** | `API_BASE_URL`, demo credentials, timeouts |
| **api/demo/** | Demo-mode write/read handlers when `EXPO_PUBLIC_DEMO_MODE` is on |

## Auth

| Method | HTTP | Endpoint |
|--------|------|----------|
| `driverLogin(email, password)` | POST | `/auth/delivery-login` |
| `driverRegister(signupData)` | POST | `/auth/signup` then creates `/resource/drivers` |
| Logout | – | Clears token + local cache (client-side) |

## Driver profile

| Method | HTTP | Endpoint |
|--------|------|----------|
| `fetchDriverByUserId()` | GET | `/resource/drivers/byUserId` |
| `getDriverProfile()` / `updateDriver` / `updateDriverProfile` | GET/PUT | `/resource/drivers…` |
| `updateUser` | PUT | `/users/me` |
| `uploadDriverDocument` | POST | upload helpers |

## Orders / deliveries

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getAvailableOrders()` | GET | `/resource/orders?status=preparing` (and related filters) |
| `getDriverOrders()` | GET | `/resource/orders?…` (driver-filtered) |
| `updateOrder(orderId, patch)` | PUT | `/resource/orders/${orderId}` |

## Payments & Stripe Connect

| Method | HTTP | Endpoint |
|--------|------|----------|
| Payment methods CRUD | GET/POST/PUT/DELETE | `/resource/paymentMethods…` |
| `startStripeConnectOnboarding` | POST | `/connect/onboarding` |
| `getStripeConnectStatus` | GET | `/connect/status` |
| `syncStripeConnectPayoutMethod` | POST | `/connect/sync` |

## Settings, support, notifications, uploads

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getSettings()` | GET | `/resource/settings` |
| `getAppConfig()` | GET | `/resource/app_settings` |
| `listCurrencies()` | GET | `/resource/currencies` |
| `getRestaurantDeliverySettings` | GET | `/resource/deliverysettings?…` |
| FAQs / tickets | GET/POST | `/resource/customersupports…` |
| Notifications | GET/PUT/DELETE | `/resource/notifications…` |
| `uploadFile` / `uploadPublicFile` | POST | `/upload`, `/upload/public` |
| Nearby restaurants | GET | `/resource/restaurants` (geo helpers) |

## Demo mode

When `EXPO_PUBLIC_DEMO_MODE=true`, selected writes/reads go through `api/demo/` handlers. Builtin demo login still uses the live API for auth (`driver@demo.com` / `driver123`).
