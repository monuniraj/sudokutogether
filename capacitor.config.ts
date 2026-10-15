import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mologic.sudokusync',
  appName: 'SudokuSync',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '116330285995-aiaskr693anl3bkhapd6vdu3kiieaphc.apps.googleusercontent.com',
      clientId: '116330285995-aiaskr693anl3bkhapd6vdu3kiieaphc.apps.googleusercontent.com',
      forceCodeForRefreshToken: false
    },
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      backgroundColor: "#0B0F17",
      androidScaleType: "CENTER_CROP",
      showSpinner: false
    }
  }
};

export default config;
