import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@services/supabaseClient';
import { criarRegistrarStyles } from '@styles/registrarStyles';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import {
  Button,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

export default function EditarConsumoScreen() {
  const theme = useTheme();
  const styles = criarRegistrarStyles(theme);
  const params = useLocalSearchParams();

  // parâmetros recebidos via navegação
  const id = params.id as string | undefined;
  const dataParam = params.data as string | undefined;
  const leituraParam = params.leitura as string | undefined;
  const valorKwhParam = params.valor_kwh as string | undefined;

  // estados locais
  const [data, setData] = useState(
    dataParam ? new Date(dataParam) : new Date(),
  );
  const [leitura, setLeitura] = useState(leituraParam || '');
  const [valorKwh, setValorKwh] = useState(valorKwhParam || '');
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [gastoEstimado, setGastoEstimado] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        // ✅ Primeiro tenta usar o que veio nos parâmetros
        if (dataParam) setData(new Date(dataParam));
        if (leituraParam) setLeitura(leituraParam);
        if (valorKwhParam) setValorKwh(valorKwhParam);

        // ✅ Se leituraParam não veio (ex: navegação direta pelo histórico)
        if (!leituraParam || !valorKwhParam) {
          const { data: userData } = await supabase.auth.getUser();
          const userId = userData?.user?.id;
          if (!userId || !id) return;

          const { data: registroDb, error } = await supabase
            .from('consumo')
            .select('data, leitura_atual, valor_kwh')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

          if (error) {
            console.error('Erro ao buscar dados do registro:', error.message);
            return;
          }

          if (registroDb) {
            // 🧩 Atualiza estados com os valores reais
            if (registroDb.data) setData(new Date(registroDb.data));
            if (registroDb.leitura_atual)
              setLeitura(String(registroDb.leitura_atual));
            if (registroDb.valor_kwh) setValorKwh(String(registroDb.valor_kwh));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do consumo:', error);
      }
    })();
  }, [id, dataParam, leituraParam, valorKwhParam]);

  const abrirPicker = () => setMostrarPicker(true);
  const aoSelecionarData = (_: any, selectedDate?: Date) => {
    setMostrarPicker(Platform.OS === 'ios');
    if (selectedDate) setData(selectedDate);
  };

  // ============================================================
  // 🔹 Editar e recalcular consumo com base na leitura inicial
  // ============================================================
  const handleEditar = async () => {
    if (!id) {
      Alert.alert('Erro', 'ID do registro não encontrado.');
      return;
    }

    const hoje = new Date();
    if (data > hoje) {
      Alert.alert('Erro', 'A data não pode ser no futuro.');
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    // 🔹 Busca o registro atual caso leituraParam venha vazia
    let novaLeituraNum = parseFloat(leitura);
    if (isNaN(novaLeituraNum) || !novaLeituraNum) {
      const { data: consumoAtual } = await supabase
        .from('consumo')
        .select('leitura_atual')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (consumoAtual?.leitura_atual) {
        novaLeituraNum = Number(consumoAtual.leitura_atual);
        setLeitura(String(consumoAtual.leitura_atual)); // 🔹 Atualiza o campo na tela
      } else {
        Alert.alert('Erro', 'Não foi possível carregar a leitura atual.');
        return;
      }
    }

    const novaData = data.toISOString().split('T')[0];
    const novoValorKwh = parseFloat(valorKwh);

    if (isNaN(novaLeituraNum) || novaLeituraNum <= 0) {
      Alert.alert('Atenção', 'Informe um valor válido de leitura.');
      return;
    }

    try {
      setIsSaving(true);

      // 🔹 Busca leitura inicial do usuário
      const { data: leituraInicialDb, error: leituraError } = await supabase
        .from('leitura_inicial')
        .select('leitura_kwh')
        .eq('user_id', userId)
        .single();

      if (leituraError && leituraError.code !== 'PGRST116') {
        console.error('Erro ao buscar leitura inicial:', leituraError.message);
      }

      const leituraAnterior = leituraInicialDb?.leitura_kwh ?? 0;
      const novoConsumo = Math.max(0, novaLeituraNum - leituraAnterior);
      const novoCusto = novoConsumo * (novoValorKwh || 0);

      // 🔹 Atualiza o registro
      const { error } = await supabase
        .from('consumo')
        .update({
          data: novaData,
          leitura_atual: novaLeituraNum,
          consumo_kwh: novoConsumo,
          valor_kwh: novoValorKwh,
          custo_estimado: novoCusto,
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        Alert.alert('Erro ao editar', error.message);
      } else {
        Alert.alert('Sucesso', 'Registro atualizado com sucesso!');
        router.replace('/(tabs)/historico');
      }
    } catch (err: any) {
      Alert.alert('Erro inesperado', err.message || 'Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // 🔹 Excluir registro
  // ============================================================
  const handleExcluir = async () => {
    if (!id) return;

    Alert.alert('Excluir registro', 'Deseja realmente excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData?.user?.id;
            if (!userId) {
              Alert.alert('Erro', 'Usuário não autenticado.');
              return;
            }

            const { error } = await supabase
              .from('consumo')
              .delete()
              .eq('id', id)
              .eq('user_id', userId);

            if (error) {
              Alert.alert('Erro ao excluir', error.message);
            } else {
              Alert.alert('Sucesso', 'Registro excluído com sucesso!');
              router.replace('/(tabs)/historico');
            }
          } catch (err: any) {
            Alert.alert('Erro inesperado', err.message || 'Tente novamente.');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  // ============================================================
  // 🔹 Atualiza gasto estimado em tempo real
  // ============================================================
  useEffect(() => {
    const calc = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      const { data: leituraInicialDb } = await supabase
        .from('leitura_inicial')
        .select('leitura_kwh')
        .eq('user_id', userId)
        .single();

      const leituraAnterior = leituraInicialDb?.leitura_kwh ?? 0;
      const consumoAtual = Number(leitura || 0) - leituraAnterior;
      const custo = consumoAtual * Number(valorKwh || 0);
      setGastoEstimado(custo);
    };

    calc();
  }, [leitura, valorKwh]);

  // ============================================================
  // 🔹 Interface
  // ============================================================
  return (
    <View style={styles.container}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
      >
        <IconButton
          icon='arrow-left'
          size={26}
          onPress={() => router.back()}
          iconColor={theme.colors.primary}
        />
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.primary,
          }}
        >
          Editar Consumo
        </Text>
      </View>

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
        label='Leitura do relógio (kWh)'
        value={leitura}
        onChangeText={setLeitura}
        keyboardType='numeric'
        style={styles.input}
      />

      <TextInput
        label='Valor do kWh (R$)'
        value={valorKwh}
        onChangeText={setValorKwh}
        keyboardType='decimal-pad'
        style={styles.input}
      />

      <Text style={{ marginTop: 6 }}>
        💰 Gasto estimado:{' '}
        <Text style={{ fontWeight: 'bold' }}>
          R$ {gastoEstimado.toFixed(2)}
        </Text>
      </Text>

      <Button
        mode='contained'
        onPress={handleEditar}
        disabled={isSaving || isDeleting}
        buttonColor={theme.colors.primary}
        style={{ marginTop: 10 }}
      >
        {isSaving ? 'Salvando...' : 'Salvar alterações'}
      </Button>

      <Button
        mode='outlined'
        onPress={handleExcluir}
        disabled={isSaving || isDeleting}
        textColor={theme.colors.error}
        style={{ marginTop: 14, borderColor: theme.colors.error }}
      >
        {isDeleting ? 'Excluindo...' : 'Excluir registro'}
      </Button>
    </View>
  );
}
