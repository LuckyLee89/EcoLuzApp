import { Stack } from 'expo-router';

export default function DispositivosLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, animation: 'slide_from_right' }}>
      <Stack.Screen
        name='index'
        options={{ title: 'Gerenciar Dispositivos' }}
      />
      <Stack.Screen
        name='listar_dispositivos'
        options={{ title: 'Listar Dispositivos' }}
      />
      <Stack.Screen
        name='registrar_dispositivos'
        options={{ title: 'Registrar Dispositivo' }}
      />
    </Stack>
  );
}
