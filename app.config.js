import 'dotenv/config';

export default {
  expo: {
    name: 'EcoluzApp',
    slug: 'ecoluzapp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/assets/images/icon.png',
    scheme: 'ecoluzapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      package: 'com.lincon.ecoluzapp',
      edgeToEdgeEnabled: true,
      permissions: [
        'WRITE_EXTERNAL_STORAGE',
        'READ_EXTERNAL_STORAGE',
        'READ_MEDIA_IMAGES',
        'READ_MEDIA_VIDEO',
        'READ_MEDIA_AUDIO',
      ],
      adaptiveIcon: {
        foregroundImage: './src/assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './src/assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './src/assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: 'e44c6630-8ac6-4d60-b3c0-76b42a3463ac',
      },
      //SUPABASE_URL: process.env.SUPABASE_URL,
      //SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SUPABASE_URL: 'https://yjxijrddcydccheasvuh.supabase.co',
      SUPABASE_ANON_KEY:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqeGlqcmRkY3lkY2NoZWFzdnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTQ4NzEsImV4cCI6MjA3NzQ5MDg3MX0.KO2hzhqksWPbZzi5zRqvUcIsu58BnOGMwnGex5QG0PM',
    },
  },
};
