# API layer – delivery-app (driver)

HTTP client in `api.js` (+ `api/demo/` for demo-mode merges). Base URL: `config.API_BASE_URL` from `EXPO_PUBLIC_API_URL`.

> Paths below match the current `api.js` sources. Compact list: [docs/endpoints.md](docs/endpoints.md).

## Architecture

| File | Role |
|------|------|
| **api.js** | Singleton client: token/driver/user, `apiCall()`, auth, orders, payments, settings, notifications |
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
| Update driver | PUT | `/resource/drivers/${driverId}` |

## Orders / deliveries

| Method | HTTP | Endpoint |
|--------|------|----------|
| Available / preparing | GET | `/resource/orders?status=preparing` |
| Driver orders | GET | `/resource/orders?…` (filtered) |
| Update order | PUT | `/resource/orders/${orderId}` |

## Payments

| Method | HTTP | Endpoint |
|--------|------|----------|
| List | GET | `/resource/paymentMethods/byUserId` |
| Create / update / delete | POST/PUT/DELETE | `/resource/paymentMethods[/${id}]` |

## Settings & support

| Method | HTTP | Endpoint |
|--------|------|----------|
| App settings | GET | `/resource/app_settings` |
| Currencies | GET | `/resource/currencies` |
| Delivery settings | GET | `/resource/deliverysettings?…` |
| FAQs / support | GET/POST | `/resource/customersupports` |
| Notifications | GET/PUT | `/resource/notifications[/${id}]` |
| Restaurants | GET | `/resource/restaurants` |

## Demo mode

When `EXPO_PUBLIC_DEMO_MODE=true`, selected writes/reads go through `api/demo/` handlers so buyers can explore offline-ish flows against seeded demo data.
