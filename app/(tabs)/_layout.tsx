import { MaterialCommunityIcons } from '@expo/vector-icons';
import { verificarAssinaturaAtiva } from '@services/assinaturaService';
import { supabase } from '@services/supabaseClient';
import { Redirect, Tabs } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from 'react-native-paper';

type Aba = {
  name: string;
  title: string;
  icon: string;
  href?: string | null; // ✅ permite null
  options?: object; // ✅ permite definir tabBarButton
};

export default function TabsLayout() {
  const theme = useTheme();
  const [assinaturaAtiva, setAssinaturaAtiva] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checarAssinatura() {
      try {
        const { data } = await supabase.auth.getUser();
        const userId = data?.user?.id;

        if (!userId) {
          setAssinaturaAtiva(false);
          return;
        }

        const ativa = await verificarAssinaturaAtiva(userId);
        setAssinaturaAtiva(!!ativa);
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
        setAssinaturaAtiva(false);
      } finally {
        setLoading(false);
      }
    }

    checarAssinatura();
  }, []);

  const abas: Aba[] = useMemo(
    () => [
      {
        name: 'index',
        title: 'Dashboard',
        icon: 'view-dashboard-outline',
      },
      {
        name: 'registrar',
        title: 'Registrar',
        icon: 'plus-box-outline',
        href: '/(tabs)/registrar',
      },
      {
        name: 'historico',
        title: 'Histórico',
        icon: 'history',
        href: '/(tabs)/historico',
      },
      {
        name: 'configuracoes',
        title: 'Configurações',
        icon: 'cog-outline',
        href: '/(tabs)/configuracoes',
      },
      {
        name: 'assinatura',
        title: 'Assinatura',
        icon: 'star-outline',
        href: '/(tabs)/assinatura',
      },
      {
        name: 'dispositivos',
        title: 'Dispositivos',
        icon: 'devices',
        // 🚫 Evita criar o botão clicável quando assinatura está inativa
        href: assinaturaAtiva ? '/(tabs)/dispositivos' : null,
        options: {
          tabBarButton: assinaturaAtiva ? undefined : () => null, // 🔒 oculta completamente a aba
        },
      },
    ],
    [assinaturaAtiva],
  );

  if (loading || assinaturaAtiva === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color={theme.colors.primary} />
      </View>
    );
  }

  // 🚫 Protege rota direta para /dispositivos
  if (
    !assinaturaAtiva &&
    typeof window !== 'undefined' &&
    window.location.pathname.includes('/dispositivos')
  ) {
    return <Redirect href='/(tabs)/assinatura' />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        headerShown: false,
      }}
    >
      {abas.map(aba => (
        <Tabs.Screen
          key={aba.name}
          name={aba.name}
          options={{
            title: aba.title,
            href: aba.href as any,
            tabBarIcon: ({ color, size, focused }) => (
              <Animatable.View
                animation={focused ? 'bounceIn' : undefined}
                duration={800}
              >
                <MaterialCommunityIcons
                  name={aba.icon as any}
                  size={size}
                  color={color}
                />
              </Animatable.View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
