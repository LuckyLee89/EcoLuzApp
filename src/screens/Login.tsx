import { supabase } from '@services/supabaseClient';
import { criarLoginStyles } from '@styles/loginStyles';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import {
  Button,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

export default function LoginScreen() {
  const theme = useTheme();
  const styles = criarLoginStyles(theme);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        // Erros tratados individualmente
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert(
            'Conta não encontrada',
            'Não encontramos um usuário com este e-mail ou senha.',
            [
              { text: 'Tentar novamente' },
              {
                text: 'Criar conta',
                onPress: () => router.push('/cadastro'),
              },
            ],
          );
        } else if (error.message.includes('Email not confirmed')) {
          setShowModal(true);
        } else {
          Alert.alert('Erro ao fazer login', error.message);
        }
        return;
      }

      // Login OK
      if (data?.user) {
        router.replace('/');
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      Alert.alert('Erro inesperado', 'Algo deu errado ao tentar fazer login.');
    } finally {
      setLoading(false);
    }
  };

  const handleReenviarEmail = async () => {
    if (!email) {
      Alert.alert('Informe seu e-mail primeiro');
      return;
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      Alert.alert('Erro ao reenviar e-mail', error.message);
    } else {
      Alert.alert(
        'E-mail reenviado',
        'Verifique sua caixa de entrada para confirmar sua conta.',
      );
      setShowModal(false);
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

      <Button
        mode='contained'
        onPress={handleLogin}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Entrar
      </Button>

      <Button
        onPress={() => router.replace('/cadastro')}
        style={{ marginTop: 12 }}
      >
        Criar conta
      </Button>

      {/* Modal para reenviar e-mail */}
      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => setShowModal(false)}
          contentContainerStyle={{
            backgroundColor: theme.colors.surface,
            margin: 24,
            padding: 24,
            borderRadius: 16,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.primary,
              marginBottom: 8,
            }}
          >
            Confirme seu e-mail
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>
            Parece que você ainda não confirmou seu cadastro. Verifique sua
            caixa de entrada ou reenvie o e-mail de confirmação abaixo.
          </Text>

          <Button
            mode='contained'
            onPress={handleReenviarEmail}
            style={{ width: '100%', marginBottom: 8 }}
          >
            Reenviar e-mail
          </Button>

          <Button onPress={() => setShowModal(false)}>Fechar</Button>
        </Modal>
      </Portal>
    </View>
  );
}
