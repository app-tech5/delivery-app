# Driver API endpoints (source of truth: `api.js`)

Base: `EXPO_PUBLIC_API_URL` (default `http://localhost:5000/api`).

## Auth

- `POST /auth/delivery-login` — `{ email, password }` → `{ token, user, … }`
- `POST /auth/signup` — driver account registration

## Driver & user

- `GET/PUT /resource/drivers…` / `GET /resource/drivers/byUserId`
- `PUT /users/me`
- `PUT /drivers/profile` (when used by profile helpers)

## Orders

- `GET/PUT /resource/orders…`

## Payments

- `GET/POST/PUT/DELETE /resource/paymentMethods…`
- `POST /connect/onboarding`
- `GET /connect/status`
- `POST /connect/sync`

## Settings & catalog

- `GET /resource/settings`
- `GET /resource/app_settings`
- `GET /resource/currencies`
- `GET /resource/deliverysettings…`
- `GET /resource/restaurants`

## Support & notifications

- `GET/POST /resource/customersupports…`
- `GET/PUT/DELETE /resource/notifications…`

## Uploads

- `POST /upload`
- `POST /upload/public`

Auth header: `Authorization: Bearer <token>` after login.
