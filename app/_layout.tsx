import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import { supabase } from '../src/services/supabaseClient';
import { EcoLuzDarkTheme, EcoLuzLightTheme } from '../src/styles/themes';

export default function RootLayout() {
  const [theme, setTheme] = useState(EcoLuzLightTheme);
  const router = useRouter();
  const pathname = usePathname();

  const rotasPublicas = ['/login', '/cadastro', '/recuperar'];

  // 🔹 Carrega tema salvo no AsyncStorage
  useEffect(() => {
    (async () => {
      const preferencia = await AsyncStorage.getItem('preferencia_tema');
      setTheme(preferencia === 'true' ? EcoLuzDarkTheme : EcoLuzLightTheme);
    })();
  }, []);

  // 🔹 Verifica sessão do usuário
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !rotasPublicas.includes(pathname)) {
        router.replace('/login');
      }
    });
  }, [router, pathname]);

  // 🔹 Estrutura principal de navegação (Tabs + Stack)
  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Grupo principal de abas */}
        <Stack.Screen name='(tabs)' />

        {/* Grupo stack — exibe cabeçalhos automaticamente */}
        <Stack.Screen
          name='stack'
          options={{
            headerShown: false, // o próprio stack interno gerencia os headers
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
