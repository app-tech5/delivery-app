import * as Location from 'expo-location';

export const colors = {
  
  white: '#ffffff',
  black: '#000000',
  
  grey: {
    50: '#f8f9fa',    
    100: '#eee',      
    200: '#d9d9d9',   
    300: '#ced4da',   
    400: '#ccc',      
    500: '#6c757d',   
    600: '#5e6977',   
    700: '#43484d',   
    800: '#2d3436',   
    900: '#111111',   
  },
  
  primary: '#000000',     
  secondary: '#ffffff',   
  accent: '#FFD700',      
  
  success: '#3d5c5c',     
  warning: '#FF9800',     
  error: '#800000',       
  info: '#2196F3',        
  
  background: {
    primary: '#ffffff',   
    secondary: '#f8f9fa', 
    card: '#ffffff',      
    modal: 'rgba(0,0,0,0.5)', 
  },

  text: {
    primary: '#111111',   
    secondary: '#666',    
    muted: '#6c757d',     
    white: '#ffffff',     
  },

  border: {
    light: '#e9ecef',     
    medium: '#dee2e6',    
    dark: '#adb5bd',      
  },
  
  auth: {
    primary: '#3d5c5c',   
    background: '#b3b3b3', 
    gradient1: ['#948E99', '#2E1437'], 
    gradient2: ['#ada996', '#f2f2f2', '#dbdbdb', '#eaeaea'], 
  },
  
  buttons: "black",
  grey1: "#43484d",     
  grey2: "#5e6977",     
  grey3: "#86939e",     
  grey4: "#bdc6cf",     
  grey5: "#e1e8ee",     
  cardComment: "#86939e",
  cardbackground: 'white',
  statusbar: '#ff8c52',
  headerText: 'white',
  
  rating: '#FFA000',    
  divider: '#F0F0F0',    
  highlight: '#FFF9E6',  
  shadow: 'rgba(0,0,0,0.1)', 
  
  driver: {
    available: '#4CAF50',      
    onDelivery: '#FF9800',     
    offline: '#757575',        
    busy: '#F44336',          
  }
}

export const parameters = {
  headerHeight: 40,
  styledButton: {
    backgroundColor: 'black',
   borderRadius: 12,
    paddingHorizontal: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: 'black',
    height: 50,
 },
 buttonTitle: {
    fontSize: 20,
    fontWeight: "bold",
   marginTop: -3
 }
}

export const title = {
  color: "black",
  fontSize: 20,
  fontWeight: "bold"
}

export const location = async () => {
 let { status } = await Location.requestForegroundPermissionsAsync();
 if (status !== 'granted') {
    setErrorMsg('Permission to access location was denied');
    return;
  }
 return await Location.getCurrentPositionAsync({});

};

export function generateUID() {
 var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}

export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

