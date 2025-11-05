// src/screens/RegistrarConsumo.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@services/supabaseClient';
import { criarRegistrarStyles } from '@styles/registrarStyles';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, View } from 'react-native';
import {
  Button,
  Modal,
  Portal,
  Provider,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

const KWH_KEY = 'valor_kwh_padrao';

function asNumber(v: string) {
  // permite vírgula e ponto
  if (!v) return 0;
  const n = parseFloat(v.replace(',', '.').replace(/[^\d.]/g, ''));
  return isNaN(n) ? 0 : n;
}
const brl = (n: number) =>
  (isNaN(n) ? 0 : n).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export default function RegistrarConsumoScreen() {
  const theme = useTheme();
  const styles = criarRegistrarStyles(theme);

  const [data, setData] = useState(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [consumo, setConsumo] = useState('');
  const [valorKwh, setValorKwh] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);

  // carrega o kWh salvo anteriormente
  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem(KWH_KEY);
      if (v) setValorKwh(v);
    })();
  }, []);

  const consumoNum = asNumber(consumo);
  const kwhNum = asNumber(valorKwh);
  const gastoEstimado = consumoNum * kwhNum;

  const abrirModal = () => setModalVisivel(true);
  const fecharModal = () => setModalVisivel(false);
  const abrirLink = () => Linking.openURL('https://exemplo.com/versao-premium');

  const abrirPicker = () => setMostrarPicker(true);
  const aoSelecionarData = (_: any, selectedDate?: Date) => {
    setMostrarPicker(Platform.OS === 'ios');
    if (selectedDate) setData(selectedDate);
  };

  const handleSubmit = async () => {
    const hoje = new Date();
    if (data > hoje) {
      Alert.alert('Erro', 'A data não pode ser no futuro.');
      return;
    }
    if (!consumoNum) {
      Alert.alert('Atenção', 'Informe o consumo (kWh).');
      return;
    }
    if (!kwhNum) {
      Alert.alert('Atenção', 'Informe o valor do kWh (R$).');
      return;
    }

    const { data: userData, error: errUser } = await supabase.auth.getUser();
    if (errUser || !userData?.user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    const dataFormatada = data.toISOString().split('T')[0];

    const { data: registrosExistentes, error: erroBusca } = await supabase
      .from('consumo')
      .select('id')
      .eq('user_id', userData.user.id)
      .eq('data', dataFormatada);

    if (erroBusca) {
      Alert.alert('Erro', 'Erro ao verificar registros existentes.');
      return;
    }
    if (registrosExistentes && registrosExistentes.length > 0) {
      Alert.alert('Atenção', 'Já existe um registro para essa data.');
      return;
    }

    // persiste o kWh para os próximos cadastros
    await AsyncStorage.setItem(KWH_KEY, valorKwh);

    const { error } = await supabase.from('consumo').insert([
      {
        user_id: userData.user.id, // se seu trigger já seta, pode remover
        data: dataFormatada,
        consumo_kwh: consumoNum,
        valor_kwh: kwhNum,
        custo_estimado: gastoEstimado.toFixed(2),
      },
    ]);

    if (error) {
      Alert.alert('Erro ao registrar consumo', error.message);
    } else {
      Alert.alert('Sucesso', 'Consumo registrado com sucesso!');
      setData(new Date());
      setConsumo('');
      router.push('/'); // Dashboard
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.titulo}>Registrar Consumo</Text>

        <TextInput
          label='Data'
          value={data.toLocaleDateString('pt-BR')}
          onFocus={abrirPicker}
          style={styles.input}
          editable={false}
          right={<TextInput.Icon icon='calendar' onPress={abrirPicker} />}
        />

        {mostrarPicker && (
          <DateTimePicker
            value={data}
            mode='date'
            display='default'
            onChange={aoSelecionarData}
            maximumDate={new Date()}
          />
        )}

        <TextInput
          mode='outlined'
          dense
          label='Consumo (kWh)'
          value={consumo}
          onChangeText={setConsumo}
          keyboardType='decimal-pad'
          style={[styles.input, { paddingTop: 6 }]}
          placeholder='Ex: 120'
          theme={{
            roundness: 8,
            colors: {
              primary: theme.colors.primary,
            },
            fonts: {
              labelLarge: { fontSize: 13 },
            },
          }}
        />

        <TextInput
          label='Valor do kWh (R$)'
          dense
          value={valorKwh}
          onChangeText={setValorKwh}
          keyboardType='decimal-pad'
          style={[styles.input, { paddingTop: 8 }]}
          mode='outlined'
          placeholder='Ex: 0,89'
          right={
            <TextInput.Icon
              icon='information-outline'
              onPress={() =>
                Alert.alert(
                  'Como descobrir o valor do kWh',
                  'Verifique na sua conta de luz o campo "Tarifa de energia". Geralmente entre R$ 0,70 e R$ 1,00 por kWh.',
                )
              }
            />
          }
        />

        <Text style={{ marginBottom: 12 }}>
          💰 Gasto estimado:{' '}
          <Text style={{ fontWeight: 'bold' }}>{brl(gastoEstimado)}</Text>
        </Text>

        <Button
          mode='contained'
          onPress={handleSubmit}
          buttonColor={theme.colors.primary}
        >
          Salvar
        </Button>

        <Button
          onPress={abrirModal}
          textColor={theme.colors.primary}
          style={{ marginTop: 16 }}
        >
          Quer facilitar? Use a versão automática
        </Button>

        <Portal>
          <Modal
            visible={modalVisivel}
            onDismiss={fecharModal}
            contentContainerStyle={styles.modal}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.modalTitulo}>✨ Versão Premium</Text>
              <Text style={styles.modalTexto}>
                Conecte dispositivos e registre automaticamente seu consumo com
                custo em tempo real.
              </Text>
              <Button
                mode='contained'
                onPress={abrirLink}
                style={[styles.botaoFechar, { marginBottom: 10 }]}
              >
                Acessar Versão Premium
              </Button>
              <Button
                onPress={fecharModal}
                style={styles.botaoFechar}
                textColor={theme.colors.onPrimary}
              >
                Fechar
              </Button>
            </View>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
}
