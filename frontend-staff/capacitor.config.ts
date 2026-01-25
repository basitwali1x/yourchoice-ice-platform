import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.yci.staff',
    appName: 'YCI Staff',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        StatusBar: {
            style: 'DARK',
            backgroundColor: '#181e23'
        },
        SplashScreen: {
            backgroundColor: '#181e23',
            launchShowDuration: 2000,
            showSpinner: false
        }
    }
};

export default config;
