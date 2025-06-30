import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@services/supabaseClient';
import { registrarStyles as styles } from '@styles/registrarStyles';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function EditarConsumoScreen() {
  const params = useLocalSearchParams();

  const paramId = params.id as string | undefined;
  const dataParam = params.data as string | undefined;
  const consumoParam = params.consumo as string | undefined;

  const [idRegistro, setIdRegistro] = useState<string | null>(paramId ?? null);
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
  useEffect(() => {
    if (!paramId && !dataParam) {
      Alert.alert(
        'Acesso inválido',
        'A tela de edição deve ser acessada através do histórico.',
      );
      router.replace('/(tabs)/historico');
    }
  }, [dataParam, paramId]);

  useEffect(() => {
    const buscarIdPorData = async () => {
      if (paramId || !dataParam) return;

      const { data: session } = await supabase.auth.getUser();
      const user = session?.user;
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const { data: resultado } = await supabase
        .from('consumo')
        .select('id')
        .eq('user_id', user.id)
        .eq('data', dataParam)
        .single();

      if (resultado?.id) {
        setIdRegistro(resultado.id);
      } else {
        Alert.alert('Erro', 'Registro não encontrado para a data informada.');
      }
    };

    buscarIdPorData();
  }, [dataParam, paramId]);

  const aoSelecionarData = (_: any, selectedDate?: Date) => {
    setMostrarPicker(Platform.OS === 'ios');
    if (selectedDate) setData(selectedDate);
  };

  const handleEditar = async () => {
    if (!idRegistro) {
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

    console.log('Comparando dados...');
    console.log('Antiga data:', antigaData, 'Nova data:', novaData);
    console.log('Antigo consumo:', antigoConsumo, 'Novo consumo:', novoConsumo);

    if (novaData === antigaData && novoConsumo === antigoConsumo) {
      Alert.alert('Aviso', 'Nenhum dado foi alterado.');
      return;
    }

    try {
      setIsSaving(true);

      const { data: updateResult, error } = await supabase
        .from('consumo')
        .update({
          data: novaData,
          consumo_kwh: novoConsumo,
        })
        .eq('id', idRegistro)
        .eq('user_id', userData.user.id)
        .select();

      console.log('Resultado do update:', updateResult);

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
        buttonColor='#1b5e20'
      >
        {isSaving ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </View>
  );
}
