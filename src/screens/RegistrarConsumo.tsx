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
const LEITURA_KEY = 'ultima_leitura_relogio';
const USER_KEY = 'last_user_id';

function asNumber(v: string) {
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
  const [leituraAtual, setLeituraAtual] = useState('');
  const [ultimaLeitura, setUltimaLeitura] = useState<number | null>(null);
  const [valorKwh, setValorKwh] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [premiumAtivo, setPremiumAtivo] = useState(false);

  useEffect(() => {
    async function verificarPremium() {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      const { data: assinatura } = await supabase
        .from('assinaturas')
        .select('ativa')
        .eq('user_id', user.user.id)
        .single();

      setPremiumAtivo(assinatura?.ativa === true);
    }
    verificarPremium();
  }, []);

  // ===============================================================
  // 🔹 Carregar dados + garantir limpeza do AsyncStorage
  // ===============================================================
  useEffect(() => {
    (async () => {
      try {
        // 🧹 Garante que nada antigo fique armazenado
        await AsyncStorage.removeItem(LEITURA_KEY);
        await AsyncStorage.removeItem(KWH_KEY);

        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) return;

        // 🧩 Se o usuário mudou, limpa todo o cache
        const lastUser = await AsyncStorage.getItem(USER_KEY);
        if (lastUser && lastUser !== userId) {
          console.log('Novo usuário detectado, limpando AsyncStorage...');
          await AsyncStorage.clear();
        }

        await AsyncStorage.setItem(USER_KEY, userId);

        // 🔹 Tenta carregar valor do kWh salvo localmente
        const v = await AsyncStorage.getItem(KWH_KEY);
        if (v) setValorKwh(v);

        // 🔹 Tenta buscar leitura inicial do Supabase
        const { data: leituraDb } = await supabase
          .from('leitura_inicial')
          .select('leitura_kwh')
          .eq('user_id', userId)
          .single();

        if (leituraDb?.leitura_kwh) {
          setUltimaLeitura(leituraDb.leitura_kwh);
          await AsyncStorage.setItem(
            LEITURA_KEY,
            leituraDb.leitura_kwh.toString(),
          );
          return;
        }

        // 🔹 Se não houver no Supabase, tenta local
        const ultimaLocal = await AsyncStorage.getItem(LEITURA_KEY);
        if (ultimaLocal) setUltimaLeitura(parseFloat(ultimaLocal));
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      }
    })();
  }, []);

  const leituraNum = asNumber(leituraAtual);
  const kwhNum = asNumber(valorKwh);
  const consumoCalculado =
    ultimaLeitura !== null && leituraNum > 0 ? leituraNum - ultimaLeitura : 0;
  const gastoEstimado = consumoCalculado * kwhNum;

  const abrirModal = () => setModalVisivel(true);
  const fecharModal = () => setModalVisivel(false);
  const abrirLink = () => Linking.openURL('https://exemplo.com/versao-premium');
  const abrirPicker = () => setMostrarPicker(true);

  const aoSelecionarData = (_: any, selectedDate?: Date) => {
    setMostrarPicker(Platform.OS === 'ios');
    if (selectedDate) setData(selectedDate);
  };

  // ===============================================================
  // 🔹 Registrar leitura inicial ou consumo normal
  // ===============================================================
  const handleSubmit = async () => {
    const hoje = new Date();
    if (data > hoje) {
      Alert.alert('Erro', 'A data não pode ser no futuro.');
      return;
    }

    if (!leituraNum) {
      Alert.alert('Atenção', 'Informe a leitura atual do relógio.');
      return;
    }

    if (!kwhNum) {
      Alert.alert('Atenção', 'Informe o valor do kWh (R$).');
      return;
    }

    const { data: userData, error: errUser } = await supabase.auth.getUser();
    if (errUser || !userData?.user) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    const userId = userData.user.id;
    const dataFormatada = data.toISOString().split('T')[0];

    // 🧭 Primeira leitura
    if (ultimaLeitura === null) {
      try {
        await supabase.from('leitura_inicial').upsert({
          user_id: userId,
          leitura_kwh: leituraNum,
          data_inicial: dataFormatada,
        });

        await AsyncStorage.setItem(LEITURA_KEY, leituraAtual);
        await AsyncStorage.setItem(KWH_KEY, valorKwh);
        setUltimaLeitura(leituraNum);

        Alert.alert(
          'Leitura inicial salva',
          'A partir de agora o app calculará automaticamente seu consumo diário com base nesta leitura.',
        );
      } catch (error: any) {
        Alert.alert('Erro ao salvar leitura inicial', error.message);
      }
      return;
    }

    // 🧮 Cálculo normal
    const consumo = leituraNum - ultimaLeitura;
    if (consumo <= 0) {
      Alert.alert(
        'Atenção',
        'A nova leitura deve ser maior que a leitura anterior.',
      );
      return;
    }

    const { error } = await supabase.from('consumo').insert([
      {
        user_id: userId,
        data: dataFormatada,
        leitura_atual: leituraNum, // ✅ nova coluna
        consumo_kwh: consumo,
        valor_kwh: kwhNum,
        custo_estimado: gastoEstimado.toFixed(2),
      },
    ]);

    if (error) {
      Alert.alert('Erro ao registrar consumo', error.message);
      return;
    }

    await AsyncStorage.setItem(LEITURA_KEY, leituraAtual);
    await AsyncStorage.setItem(KWH_KEY, valorKwh);
    setUltimaLeitura(leituraNum);

    Alert.alert('Sucesso', 'Consumo registrado com sucesso!');
    setData(new Date());
    setLeituraAtual('');
    router.push('/(tabs)/historico');
  };

  // ===============================================================
  // 🔹 Interface
  // ===============================================================
  if (premiumAtivo) {
    return (
      <View style={styles.container}>
        <Text variant='titleLarge' style={{ marginBottom: 16 }}>
          📊 Você é Premium!
        </Text>
        <Button
          mode='contained'
          onPress={() => router.push('/stack/temporeal')}
        >
          Ver consumo em tempo real
        </Button>
      </View>
    );
  }

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.titulo}>Registrar Consumo Manual</Text>

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

        {ultimaLeitura !== null && (
          <Text style={{ color: '#666', marginBottom: 6 }}>
            Leitura anterior: {ultimaLeitura.toFixed(2)} kWh
          </Text>
        )}

        <TextInput
          mode='outlined'
          dense
          label='Leitura atual do relógio (kWh)'
          value={leituraAtual}
          onChangeText={setLeituraAtual}
          keyboardType='decimal-pad'
          style={[styles.input, { paddingTop: 6 }]}
          placeholder='Ex: 2578'
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
        />

        {ultimaLeitura !== null && (
          <View style={{ marginVertical: 10 }}>
            <Text style={{ marginBottom: 4 }}>
              ⚡ Consumo calculado:{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {consumoCalculado.toFixed(2)} kWh
              </Text>
            </Text>
            <Text>
              💰 Gasto estimado:{' '}
              <Text style={{ fontWeight: 'bold' }}>{brl(gastoEstimado)}</Text>
            </Text>
          </View>
        )}

        <Button
          mode='contained'
          onPress={handleSubmit}
          buttonColor={theme.colors.primary}
        >
          {ultimaLeitura === null ? 'Salvar leitura inicial' : 'Salvar consumo'}
        </Button>

        <Button
          onPress={abrirModal}
          textColor={theme.colors.primary}
          style={{ marginTop: 16 }}
        >
          Quer automatizar? Conheça a versão com sensores
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
