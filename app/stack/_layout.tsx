// app/stack/_layout.tsx
import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='temporeal'
        options={{
          title: 'Energia em Tempo Real',
          headerShown: true,
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name='register'
        options={{
          title: 'Registrar Dispositivo',
          headerShown: true,
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack>
  );
}
