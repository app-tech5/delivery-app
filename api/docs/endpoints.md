# Driver API endpoints (source of truth: `api.js`)

Base: `EXPO_PUBLIC_API_URL` (default `http://localhost:5000/api`).

## Auth

- `POST /auth/delivery-login` — `{ email, password }` → `{ token, user, … }`
- `POST /auth/signup` — driver account registration

## Resources

- `GET/PUT /resource/drivers…` / `GET /resource/drivers/byUserId`
- `GET/PUT /resource/orders…`
- `GET/POST/PUT/DELETE /resource/paymentMethods…`
- `GET /resource/app_settings`
- `GET /resource/currencies`
- `GET /resource/deliverysettings…`
- `GET/POST /resource/customersupports…`
- `GET/PUT /resource/notifications…`
- `GET /resource/restaurants`
- `GET/PUT /resource/settings…`

Auth header: `Authorization: Bearer <token>` after login.
