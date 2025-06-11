import { useAuth } from '@hooks/useAuth';
import React from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-paper';

export default function ConfiguracoesScreen() {
  const { logout } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <Text style={{ fontSize: 20 }}>Configurações do EcoLuz</Text>

      <Button mode='outlined' onPress={logout}>
        Sair do app
      </Button>
    </View>
  );
}
