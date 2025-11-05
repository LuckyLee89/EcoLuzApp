import { useAuth } from '@hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useConfiguracoesStyles } from '@styles/configuracoesStyles';
import { router } from 'expo-router';
import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import {
  Button,
  Divider,
  List,
  Switch,
  Text,
  useTheme,
} from 'react-native-paper';

export default function ConfiguracoesScreen() {
  const { logout } = useAuth();
  const { dark } = useTheme();
  const styles = useConfiguracoesStyles(); // estilos agora com base no tema

  const [modoEscuro, setModoEscuro] = useState(dark);
  const [economiaDados, setEconomiaDados] = useState(false);

  useEffect(() => {
    (async () => {
      const storedEconomia = await AsyncStorage.getItem('economia_dados');
      setEconomiaDados(storedEconomia === 'true');

      const storedTema = await AsyncStorage.getItem('preferencia_tema');
      setModoEscuro(storedTema === 'true');
    })();
  }, []);

  const alternarTema = () => {
    Alert.alert('Trocar tema', 'O app será reiniciado para aplicar o tema.', [
      {
        text: 'OK',
        onPress: async () => {
          await AsyncStorage.setItem(
            'preferencia_tema',
            (!modoEscuro).toString(),
          );
          await Updates.reloadAsync();
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const alternarEconomia = async () => {
    const novoValor = !economiaDados;
    setEconomiaDados(novoValor);
    await AsyncStorage.setItem('economia_dados', novoValor.toString());
  };

  const limparDadosLocais = async () => {
    await AsyncStorage.clear();
    Alert.alert('Sucesso', 'Dados locais foram limpos.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>⚙️ Configurações</Text>

      <List.Section>
        <List.Subheader>Preferências</List.Subheader>

        <View style={styles.item}>
          <Text style={styles.label}>Modo escuro</Text>
          <Switch value={modoEscuro} onValueChange={alternarTema} />
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Economia de dados</Text>
          <Switch value={economiaDados} onValueChange={alternarEconomia} />
        </View>

        <Divider style={styles.divisor} />

        <Button
          mode='outlined'
          onPress={limparDadosLocais}
          style={styles.botao}
        >
          🧹 Limpar dados locais
        </Button>

        <Button mode='outlined' onPress={() => router.push('/assinatura')}>
          Assinar Ecoluz Premium
        </Button>

        <Button
          mode='outlined'
          onPress={async () => {
            try {
              Alert.alert('Sair do app', 'Deseja realmente sair?', [
                {
                  text: 'Cancelar',
                  style: 'cancel',
                },
                {
                  text: 'Sim',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // 1️⃣ Faz logout no Supabase
                      await logout();
                      await AsyncStorage.clear();

                      // 2️⃣ (Opcional) log para debug
                      console.log('Usuário saiu e dados locais foram limpos.');

                      // 3️⃣ Redireciona para tela de login
                      router.replace('/login');
                    } catch (err) {
                      console.error('Erro ao sair:', err);
                      Alert.alert('Erro', 'Não foi possível sair do app.');
                    }
                  },
                },
              ]);
            } catch (err) {
              console.error('Erro inesperado no logout:', err);
            }
          }}
          style={styles.botao}
        >
          🚪 Sair do app
        </Button>
      </List.Section>

      <Divider style={styles.divisor} />

      <List.Section>
        <List.Subheader>Sobre</List.Subheader>
        <Text style={styles.info}>🌱 EcoLuz v1.0.0</Text>
        <Text style={styles.info}>
          Aplicativo para monitoramento de consumo energético residencial.
        </Text>
      </List.Section>
    </ScrollView>
  );
}
