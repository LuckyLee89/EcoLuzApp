import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { supabase } from '../src/services/supabaseClient';
import { loginStyles as styles } from '../src/styles/loginStyles';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert('Login falhou: ' + error.message);
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../src/assets/logo_sem_fundo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Bem-vindo ao EcoLuz ⚡</Text>
      <Text style={styles.subtitle}>Monitore seu consumo de energia</Text>

      <TextInput
        label='E-mail'
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        label='Senha'
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />

      <Button mode='contained' onPress={handleLogin} style={styles.button}>
        Entrar
      </Button>
    </View>
  );
}
