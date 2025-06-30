import { supabase } from '@services/supabaseClient';
import { loginStyles as styles } from '@styles/loginStyles';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      console.error(error.message);
      Alert.alert('Erro ao fazer login', error.message);
    } else {
      router.replace('/'); // Redireciona para o Dashboard
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EcoLuz ⚡</Text>
      <Text style={styles.subtitle}>Acompanhe seu consumo elétrico</Text>

      <TextInput
        label='E-mail'
        value={email}
        onChangeText={setEmail}
        keyboardType='email-address'
        autoCapitalize='none'
        style={styles.input}
      />

      <TextInput
        label='Senha'
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />

      <Button mode='contained' onPress={handleLogin} buttonColor='#1b5e20'>
        Entrar
      </Button>
    </View>
  );
}
