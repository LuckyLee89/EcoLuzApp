import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { menuDispositivosStyles } from '../../styles/dispositivos/menuDispositivosStyles';

export default function MenuDispositivos() {
  const theme = useTheme();
  const estilos = menuDispositivosStyles(theme);

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Gerenciar Dispositivos</Text>

      <Card style={estilos.card}>
        <Card.Content>
          <Text style={estilos.descricao}>Escolha o que deseja fazer:</Text>

          <Button
            mode='contained'
            style={estilos.botao}
            buttonColor={theme.colors.primary}
            onPress={() =>
              router.push('/(tabs)/dispositivos/listar_dispositivos')
            }
          >
            📋 Listar Dispositivos
          </Button>

          <Button
            mode='contained'
            style={estilos.botao}
            onPress={() =>
              router.push('/(tabs)/dispositivos/registrar_dispositivos')
            }
          >
            ➕ Registrar Novo
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}
