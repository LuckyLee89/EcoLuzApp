import { supabase } from '@services/supabaseClient';
import { criarLoginStyles } from '@styles/loginStyles';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';

export default function CadastroUsuarioScreen() {
  const theme = useTheme();
  const styles = criarLoginStyles(theme);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleCadastro = async () => {
    if (senha !== confirmarSenha) {
      Alert.alert('As senhas não coincidem');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      console.error(error.message);
      Alert.alert('Erro ao cadastrar', error.message);
    } else {
      Alert.alert(
        'Verifique seu e-mail',
        'Enviamos um link de confirmação para o seu e-mail. Confirme para ativar sua conta.',
      );
      router.replace('/login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta ⚡</Text>
      <Text style={styles.subtitle}>
        Cadastre-se para começar a monitorar seu consumo
      </Text>

      <TextInput
        label='E-mail'
        value={email}
        onChangeText={setEmail}
        keyboardType='email-address'
        autoCapitalize='none'
        style={styles.input}
        mode='outlined'
      />

      <TextInput
        label='Senha'
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
        mode='outlined'
      />

      <TextInput
        label='Confirmar senha'
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        secureTextEntry
        style={styles.input}
        mode='outlined'
      />

      <Button mode='contained' onPress={handleCadastro} style={styles.button}>
        Cadastrar
      </Button>

      <Button
        onPress={() => router.replace('/login')}
        style={{ marginTop: 12 }}
      >
        Já tenho conta
      </Button>
    </View>
  );
}
