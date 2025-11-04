import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { DeviceService } from '../../services/deviceService';
import { supabase } from '../../services/supabaseClient';
import { registrarDispositivosStyles } from '../../styles/dispositivos/registrarDispositivosStyle';

export default function RegistrarDispositivo() {
  const theme = useTheme();
  const estilos = registrarDispositivosStyles(theme);

  const [nome, setNome] = useState('');
  const [modelo, setModelo] = useState('ESP32+PZEM-004T');
  const [localizacao, setLocalizacao] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [chaveGerada, setChaveGerada] = useState<string | null>(null);

  async function registrar() {
    try {
      setCarregando(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuário não autenticado.');

      const resposta = await DeviceService.registrar(
        user.id,
        nome,
        modelo,
        localizacao,
      );

      if (resposta.error) {
        Alert.alert('Erro', resposta.error);
        return;
      }

      if (resposta.device_key) {
        setChaveGerada(resposta.device_key);
        Alert.alert(
          '✅ Dispositivo cadastrado',
          `Chave: ${resposta.device_key}`,
        );
      } else {
        Alert.alert(
          '✅ Dispositivo cadastrado',
          'Registro realizado com sucesso.',
        );
      }

      setNome('');
      setModelo('ESP32+PZEM-004T');
      setLocalizacao('');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao registrar dispositivo.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Registrar Novo Dispositivo</Text>

      <TextInput
        label='Nome do dispositivo'
        value={nome}
        onChangeText={setNome}
        style={estilos.input}
        mode='outlined'
        outlineColor={theme.colors.primary}
      />

      <TextInput
        label='Modelo'
        value={modelo}
        onChangeText={setModelo}
        style={estilos.input}
        mode='outlined'
        outlineColor={theme.colors.primary}
      />

      <TextInput
        label='Localização'
        value={localizacao}
        onChangeText={setLocalizacao}
        style={estilos.input}
        mode='outlined'
        outlineColor={theme.colors.primary}
      />

      {carregando ? (
        <ActivityIndicator
          animating
          color={theme.colors.primary}
          style={{ marginVertical: 12 }}
        />
      ) : (
        <Button
          mode='contained'
          onPress={registrar}
          buttonColor={theme.colors.primary}
          textColor='#fff'
          style={estilos.botao}
        >
          Registrar
        </Button>
      )}

      {chaveGerada && (
        <Card style={estilos.cardChave}>
          <Card.Content>
            <Text style={estilos.chaveTitulo}>🔑 Chave do Dispositivo</Text>
            <Text selectable style={estilos.chave}>
              {chaveGerada}
            </Text>
            <Text style={estilos.chaveHint}>
              Guarde esta chave — será usada no ESP32.
            </Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );
}
