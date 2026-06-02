// Configuration de l'application Delivery Driver
export const config = {
  // URL de votre serveur Express/MongoDB
  // Pour le développement local :
  API_BASE_URL: 'http://localhost:5000/api',

  // Pour le développement avec ngrok (si nécessaire) :
  // API_BASE_URL: 'https://votre-ngrok-url.ngrok-free.dev/api',
  // API_BASE_URL: 'https://deshawn-athermanous-indefensibly.ngrok-free.dev/api',

  // Configuration Google Maps (nécessaire pour la géolocalisation)
  GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',

  // Informations de l'application
  APP_NAME: 'Good Food Driver',
  VERSION: '1.1.0',

  // Mode démonstration - préremplit les champs de connexion driver
  DEMO_MODE: false,

  // Identifiants de démonstration (utilisés uniquement en mode DEMO_MODE)
  DEMO_EMAIL: 'driver@demo.com',
  DEMO_PASSWORD: 'driver123',

  // Timeout pour les requêtes API (en millisecondes)
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
