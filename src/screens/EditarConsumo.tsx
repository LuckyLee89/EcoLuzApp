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

  // parâmetros recebidos
  const id = params.id as string | undefined;
  const dataParam = params.data as string | undefined;
  const consumoParam = params.consumo as string | undefined;
  const valorKwhParam = params.valor_kwh as string | undefined;

  // estados locais
  const [data, setData] = useState(
    dataParam ? new Date(dataParam) : new Date(),
  );
  const [consumo, setConsumo] = useState(consumoParam || '');
  const [valorKwh, setValorKwh] = useState(valorKwhParam || '');
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dataParam) setData(new Date(dataParam));
    if (consumoParam) setConsumo(consumoParam);
    if (valorKwhParam) setValorKwh(valorKwhParam);
  }, [dataParam, consumoParam, valorKwhParam]);

  const abrirPicker = () => setMostrarPicker(true);

  const aoSelecionarData = (_: any, selectedDate?: Date) => {
    setMostrarPicker(Platform.OS === 'ios');
    if (selectedDate) setData(selectedDate);
  };

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
    if (!userData?.user) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    const novaData = data.toISOString().split('T')[0];
    const novoConsumo = parseFloat(consumo);
    const novoValorKwh = parseFloat(valorKwh);
    const novoCusto = novoConsumo * (novoValorKwh || 0);

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('consumo')
        .update({
          data: novaData,
          consumo_kwh: novoConsumo,
          valor_kwh: novoValorKwh,
          custo_estimado: novoCusto,
        })
        .eq('id', id)
        .eq('user_id', userData.user.id);

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

  const gastoEstimado = Number(consumo || 0) * Number(valorKwh || 0);

  return (
    <View style={styles.container}>
      {/* ======= Cabeçalho com seta de voltar ======= */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
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

      {/* ======= Formulário ======= */}
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
        label='Consumo (kWh)'
        value={consumo}
        onChangeText={setConsumo}
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

      <Text style={{ marginBottom: 8, marginTop: 4 }}>
        💰 Gasto estimado:{' '}
        <Text style={{ fontWeight: 'bold' }}>
          R$ {gastoEstimado.toFixed(2)}
        </Text>
      </Text>

      <Button
        mode='contained'
        onPress={handleEditar}
        disabled={isSaving}
        buttonColor={theme.colors.primary}
      >
        {isSaving ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </View>
  );
}
