// src/screens/LoginScreen.tsx
import { supabase } from '@services/supabaseClient';
import { criarLoginStyles } from '@styles/loginStyles';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import {
  Button,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

// ⚙️ Finaliza sessões pendentes de OAuth ao abrir o app
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const theme = useTheme();
  const styles = criarLoginStyles(theme);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // 🔗 PROCESSA RETORNO DO NAVEGADOR (OAuth → Deep Link)
  // ==========================================================
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log('🔗 Deep link retornado:', event.url);
      if (!event.url.includes('access_token')) return;

      try {
        // Extrai os tokens do fragmento da URL
        const fragment = event.url.split('#')[1];
        if (!fragment) {
          console.warn('⚠️ Nenhum fragmento encontrado na URL');
          return;
        }

        const params = Object.fromEntries(new URLSearchParams(fragment));
        const { access_token, refresh_token } = params;

        if (!access_token) {
          console.warn('⚠️ Nenhum access_token recebido');
          return;
        }

        console.log('🔑 Tokens recebidos:', {
          access: !!access_token,
          refresh: !!refresh_token,
        });

        // Define a sessão manualmente no Supabase
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token: refresh_token || '',
        });

        if (error) {
          console.error('❌ Erro ao definir sessão manual:', error.message);
          return;
        }

        if (data?.session) {
          console.log('✅ Sessão restaurada:', data.session.user.email);
          router.replace('/');
        } else {
          console.warn('⚠️ Nenhuma sessão retornada após setSession');
        }
      } catch (err) {
        console.error('🔥 Erro ao processar deep link:', err);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  // ==========================================================
  // 🌍 MONITORA ALTERAÇÕES DE SESSÃO (LOGIN/LOGOUT)
  // ==========================================================
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('📡 Auth change event:', event);
        if (session?.user) {
          console.log('✅ Sessão detectada:', session.user.email);
          router.replace('/');
        }
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  // ==========================================================
  // 🔐 LOGIN COM GOOGLE (OAuth)
  // ==========================================================
  const handleLoginGoogle = async () => {
    try {
      const redirectTo =
        Constants.appOwnership === 'expo'
          ? 'https://auth.expo.io/@luckylee89/ecoluzapp' // Ambiente Expo Go
          : 'ecoluzapp://login'; // Build nativo

      console.log('🌍 Iniciando login Google com redirect:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true, // Captura a URL manualmente
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ Erro Supabase OAuth:', error.message);
        Alert.alert('Erro', 'Falha no login com Google.');
        return;
      }

      if (!data?.url) {
        console.error('🚫 Nenhuma URL retornada pelo Supabase');
        Alert.alert('Erro', 'Não foi possível iniciar o login.');
        return;
      }

      console.log('🌐 Abrindo navegador com URL:', data.url);
      await WebBrowser.openBrowserAsync(data.url);

      console.log('✅ Login iniciado — aguardando retorno...');
    } catch (err) {
      console.error('🔥 Erro inesperado no login Google:', err);
      Alert.alert('Erro inesperado', 'Falha ao tentar login com Google.');
    }
  };

  // ==========================================================
  // ✉️ LOGIN TRADICIONAL POR E-MAIL/SENHA
  // ==========================================================
  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert('Conta não encontrada', 'E-mail ou senha incorretos.', [
            { text: 'Tentar novamente' },
            { text: 'Criar conta', onPress: () => router.push('/cadastro') },
          ]);
        } else if (error.message.includes('Email not confirmed')) {
          setShowModal(true);
        } else {
          Alert.alert('Erro', error.message);
        }
        return;
      }

      if (data?.user) {
        console.log('✅ Login com e-mail bem-sucedido:', data.user.email);
        router.replace('/');
      }
    } catch (err) {
      console.error('🔥 Erro inesperado no login por e-mail:', err);
      Alert.alert('Erro inesperado', 'Algo deu errado.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // 🧱 INTERFACE
  // ==========================================================
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
        icon='google'
        mode='outlined'
        onPress={handleLoginGoogle}
        style={{ marginTop: 16 }}
      >
        {' '}
        Entrar com Google{' '}
      </Button>

      <Button
        onPress={() => router.replace('/cadastro')}
        style={{ marginTop: 12 }}
      >
        Criar conta
      </Button>

      {/* 🔔 Modal de confirmação de e-mail */}
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
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            Confirme seu e-mail
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>
            Parece que você ainda não confirmou seu cadastro. Verifique sua
            caixa de entrada.
          </Text>
          <Button mode='contained' onPress={() => Alert.alert('Em breve')}>
            Reenviar e-mail
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}
