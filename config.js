
export const config = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',

  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',

  APP_NAME: 'Good Food Driver',
  VERSION: '1.1.0',

  DEMO_MODE: process.env.EXPO_PUBLIC_DEMO_MODE !== 'false',

  DEMO_EMAIL: process.env.EXPO_PUBLIC_DEMO_EMAIL || 'driver@demo.com',
  DEMO_PASSWORD: process.env.EXPO_PUBLIC_DEMO_PASSWORD || 'driver123',

  API_TIMEOUT: 10000,
};

export const DOCUMENT_TYPES = ['driver_license', 'insurance', 'identity_card'];

export const PUBLIC_UPLOAD_FOLDERS = {
  AVATARS: 'avatars',
  RESTAURANTS: 'restaurants',
  PRODUCTS: 'products',
  MENU: 'menu',
  BANNERS: 'banners',
  CATEGORIES: 'categories',
};
