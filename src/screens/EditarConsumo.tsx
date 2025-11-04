import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@services/supabaseClient';
import { criarRegistrarStyles } from '@styles/registrarStyles';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';

export default function EditarConsumoScreen() {
  const theme = useTheme();
  const styles = criarRegistrarStyles(theme);

  const params = useLocalSearchParams();

  const id = params.id as string | undefined;
  const dataParam = params.data as string | undefined;
  const consumoParam = params.consumo as string | undefined;

  const [data, setData] = useState(
    dataParam ? new Date(dataParam) : new Date(),
  );
  const [consumo, setConsumo] = useState(consumoParam || '');
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const abrirPicker = () => setMostrarPicker(true);

  useEffect(() => {
    if (dataParam) setData(new Date(dataParam));
    if (consumoParam) setConsumo(consumoParam);
  }, [dataParam, consumoParam]);

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
    const antigaData = dataParam ?? '';
    const antigoConsumo = parseFloat(consumoParam ?? '0');

    if (novaData === antigaData && novoConsumo === antigoConsumo) {
      Alert.alert('Aviso', 'Nenhum dado foi alterado.');
      return;
    }

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('consumo')
        .update({
          data: novaData,
          consumo_kwh: novoConsumo,
        })
        .eq('id', id.toString())
        .eq('user_id', userData.user.id.toString())
        .select();

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

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Editar Consumo</Text>

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
