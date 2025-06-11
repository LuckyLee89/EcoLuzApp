import { supabase } from '@services/supabaseClient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function RegistrarConsumoScreen() {
  const [data, setData] = useState('');
  const [consumo, setConsumo] = useState('');

  const handleSubmit = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      alert('Usuário não autenticado');
      return;
    }

    const { error } = await supabase.from('consumo').insert([
      {
        user_id: userData.user.id,
        data,
        consumo_kwh: parseFloat(consumo),
      },
    ]);

    if (error) {
      alert('Erro ao registrar consumo: ' + error.message);
    } else {
      alert('Consumo registrado com sucesso!');
      setData('');
      setConsumo('');
      router.push('/');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registrar Consumo</Text>

      <TextInput
        label='Data (YYYY-MM-DD)'
        value={data}
        onChangeText={setData}
        keyboardType='numeric'
        style={styles.input}
      />

      <TextInput
        label='Consumo (kWh)'
        value={consumo}
        onChangeText={setConsumo}
        keyboardType='numeric'
        style={styles.input}
      />

      <Button mode='contained' onPress={handleSubmit}>
        Salvar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { marginBottom: 16 },
});
