import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name='index' options={{ title: 'Dashboard' }} />
      <Tabs.Screen name='registrar' options={{ title: 'Registrar' }} />
      <Tabs.Screen name='historico' options={{ title: 'Histórico' }} />
      <Tabs.Screen name='configuracoes' options={{ title: 'Configurações' }} />
    </Tabs>
  );
}
