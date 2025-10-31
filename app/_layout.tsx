import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import { supabase } from '../src/services/supabaseClient';
import { EcoLuzDarkTheme, EcoLuzLightTheme } from '../src/styles/themes';

export default function RootLayout() {
  const [theme, setTheme] = useState(EcoLuzLightTheme);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      const preferencia = await AsyncStorage.getItem('preferencia_tema');
      setTheme(preferencia === 'true' ? EcoLuzDarkTheme : EcoLuzLightTheme);
    })();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && pathname !== '/login') {
        setTimeout(() => {
          router.replace('/login');
        }, 0);
      }
    });
  }, [router, pathname]);

  return (
    <PaperProvider theme={theme}>
      <Slot />
    </PaperProvider>
  );
}
