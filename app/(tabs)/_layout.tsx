import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { useTheme } from 'react-native-paper';

export default function TabsLayout() {
  const theme = useTheme();

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
      <Tabs.Screen
        name='index'
        options={{
          title: 'Dashboard',

          tabBarIcon: ({ color, size, focused }) => (
            <Animatable.View
              animation={focused ? 'bounceIn' : undefined}
              duration={800}
              useNativeDriver
            >
              <MaterialCommunityIcons
                name='view-dashboard-outline'
                size={size}
                color={color}
              />
            </Animatable.View>
          ),
        }}
      />
      <Tabs.Screen
        name='registrar'
        options={{
          title: 'Registrar',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name='plus-box-outline'
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='historico'
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name='history' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='configuracoes'
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name='cog-outline'
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='assinatura'
        options={{
          title: 'Assinatura',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name='star-outline'
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
