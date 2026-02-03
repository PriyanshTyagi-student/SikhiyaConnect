import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sikhiyaconnect.edu',
  appName: 'Sikhiya Connect',
  webDir: 'out',
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff',
      overlaysWebView: false
    },
    SplashScreen: {
      launchShowDuration: 0,
      showSpinner: false
    }
  },
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
