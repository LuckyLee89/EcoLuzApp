import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@services/supabaseClient';
import { registrarStyles as styles } from '@styles/registrarStyles';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, Platform, View } from 'react-native';
import {
  Button,
  Modal,
  Portal,
  Provider,
  Text,
  TextInput,
} from 'react-native-paper';

export default function RegistrarConsumoScreen() {
  const [data, setData] = useState(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [consumo, setConsumo] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);

  const abrirModal = () => setModalVisivel(true);
  const fecharModal = () => setModalVisivel(false);
  const abrirLink = () => {
    Linking.openURL('https://exemplo.com/versao-premium');
  };

  const handleSubmit = async () => {
    const hoje = new Date();
    if (data > hoje) {
      Alert.alert('Erro', 'A data não pode ser no futuro.');
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      alert('Usuário não autenticado');
      return;
    }

    const dataFormatada = data.toISOString().split('T')[0];

    // Verifica se já existe um registro com essa data para o usuário
    const { data: registrosExistentes, error: erroBusca } = await supabase
      .from('consumo')
      .select('id')
      .eq('user_id', userData.user.id)
      .eq('data', dataFormatada);

    if (erroBusca) {
      console.error(erroBusca.message);
      Alert.alert('Erro', 'Erro ao verificar registros existentes.');
      return;
    }

    if (registrosExistentes.length > 0) {
      Alert.alert('Atenção', 'Já existe um registro para essa data.');
      return;
    }

    // Se não existe, insere
    const { error } = await supabase.from('consumo').insert([
      {
        user_id: userData.user.id,
        data: dataFormatada,
        consumo_kwh: parseFloat(consumo),
      },
    ]);

    if (error) {
      console.error(error.message);
      Alert.alert('Erro ao registrar consumo', error.message);
    } else {
      Alert.alert('Sucesso', 'Consumo registrado com sucesso!');
      setData(new Date());
      setConsumo('');
      router.push('/');
    }
  };

  const abrirPicker = () => setMostrarPicker(true);
  const aoSelecionarData = (_: any, selectedDate?: Date) => {
    setMostrarPicker(Platform.OS === 'ios');
    if (selectedDate) setData(selectedDate);
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
          label='Consumo (kWh)'
          value={consumo}
          onChangeText={setConsumo}
          keyboardType='numeric'
          style={styles.input}
        />

        <Button mode='contained' onPress={handleSubmit} buttonColor='#1b5e20'>
          Salvar
        </Button>

        <Button
          onPress={abrirModal}
          textColor='#1b5e20'
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
                Conecte sua conta a dispositivos inteligentes (Tuya) e registre
                automaticamente o consumo diário.
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
                textColor='#fff'
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
