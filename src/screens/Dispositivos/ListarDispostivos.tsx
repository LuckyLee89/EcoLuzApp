import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  IconButton,
  Text,
  useTheme,
} from 'react-native-paper';
import { DeviceService } from '../../services/deviceService';
import { supabase } from '../../services/supabaseClient';
import { listarDispositivosStyles } from '../../styles/dispositivos/listarDispositivosStyle';
import { Dispositivo } from '../../types/device';

export default function ListarDispositivos() {
  const theme = useTheme();
  const estilos = listarDispositivosStyles(theme);

  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDispositivos = useCallback(async () => {
    try {
      setCarregando(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuário não autenticado.');

      const lista = await DeviceService.listar(user.id);
      setDispositivos(lista);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao carregar dispositivos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDispositivos();
  }, [carregarDispositivos]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDispositivos();
    setRefreshing(false);
  };

  async function deletarDispositivo(id: string) {
    Alert.alert(
      'Confirmar exclusão',
      'Deseja realmente excluir este dispositivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await DeviceService.deletar(id);
              setDispositivos(dispositivos.filter(d => d.id !== id));
            } catch (err: any) {
              Alert.alert(
                'Erro',
                err.message || 'Falha ao excluir dispositivo.',
              );
            }
          },
        },
      ],
    );
  }

  if (carregando) {
    return (
      <View style={estilos.loadingContainer}>
        <ActivityIndicator animating color={theme.colors.primary} />
        <Text style={{ color: theme.colors.primary, marginTop: 10 }}>
          Carregando dispositivos...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={estilos.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={estilos.titulo}>Meus Dispositivos</Text>

      {dispositivos.length === 0 && (
        <Text style={estilos.semDados}>
          Nenhum dispositivo registrado ainda.
        </Text>
      )}

      {dispositivos.map(disp => (
        <Card key={disp.id} style={estilos.card}>
          <Card.Title
            title={disp.nome}
            subtitle={`${disp.modelo} — ${disp.localizacao || 'Sem local'}`}
            right={() => (
              <IconButton
                icon='delete'
                iconColor={theme.colors.error}
                onPress={() => deletarDispositivo(disp.id)}
              />
            )}
          />
          <Card.Content>
            <Text style={estilos.info}>
              📅 Criado em: {new Date(disp.created_at).toLocaleDateString()}
            </Text>
          </Card.Content>
        </Card>
      ))}

      <Button
        mode='contained'
        onPress={carregarDispositivos}
        buttonColor={theme.colors.primary}
        textColor='#fff'
        style={{ marginVertical: 20 }}
      >
        Atualizar Lista
      </Button>
    </ScrollView>
  );
}
