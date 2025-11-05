import { supabase } from '@services/supabaseClient';
import { criarAssinaturaCheckoutStyles } from '@styles/assinaturaCheckoutStyles';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  TextInput as RNTextInput,
  ScrollView,
  View,
} from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';

/* ======= Helpers ======= */
const onlyDigits = (s: string) => s.replace(/\D/g, '');

const formatCardNumberLive = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  let formatted = '';
  for (let i = 0; i < digits.length; i++) {
    formatted += digits[i];
    if ((i + 1) % 4 === 0 && i < digits.length - 1) formatted += ' ';
  }
  return formatted;
};

const formatExpiryLive = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  return digits;
};

function luhnCheck(cardNumber: string) {
  const digits = cardNumber
    .replace(/\s/g, '')
    .split('')
    .reverse()
    .map(d => parseInt(d, 10));
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 1) {
      d = d * 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

function expiryIsValid(expiry: string) {
  const digits = expiry.replace(/\D/g, '');
  if (digits.length !== 4) return false;
  const mm = parseInt(digits.slice(0, 2), 10);
  const yy = parseInt(digits.slice(2, 4), 10);
  if (mm < 1 || mm > 12) return false;
  const fullYear = 2000 + yy;
  const now = new Date();
  const exp = new Date(fullYear, mm, 0);
  return exp >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/* ======= Componente ======= */
export default function AssinaturaCheckout() {
  const theme = useTheme();
  const styles = criarAssinaturaCheckoutStyles(theme);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cartao, setCartao] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validadeRef = useRef<RNTextInput>(null);
  const cvvRef = useRef<RNTextInput>(null);

  useEffect(() => {
    async function carregarUsuario() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (user?.email) setEmail(user.email);
      if (user?.user_metadata?.name) setNome(user.user_metadata.name);
    }
    carregarUsuario();
  }, []);

  /* ======= Validações ======= */
  const handleAssinar = async () => {
    const cardDigits = onlyDigits(cartao);
    const validadeDigits = onlyDigits(validade);

    if (!nome.trim())
      return Alert.alert('Erro', 'O nome completo é obrigatório.');
    if (!email.trim()) return Alert.alert('Erro', 'O e-mail é obrigatório.');
    if (cardDigits.length < 13)
      return Alert.alert('Erro', 'Número do cartão inválido.');
    if (!luhnCheck(cartao))
      return Alert.alert('Erro', 'Número do cartão inválido.');
    if (!expiryIsValid(validade))
      return Alert.alert('Erro', 'Validade inválida.');
    if (cvv.length < 3 || cvv.length > 4)
      return Alert.alert('Erro', 'CVV deve ter 3 ou 4 dígitos.');

    try {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const resp = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/criar-assinatura`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plano: 'Premium',
            card_last4: cardDigits.slice(-4),
            card_expiry: validade,
            nome,
            email,
          }),
        },
      );

      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Erro desconhecido');

      Alert.alert('Sucesso', 'Assinatura ativada com sucesso!');
      router.replace('/(tabs)/assinatura');
    } catch (err: any) {
      Alert.alert('Erro ao assinar', err.message || 'Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ======= Render ======= */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>💳 Finalizar Assinatura</Text>
      <Text style={styles.subtitulo}>Plano Premium — R$ 19,90/mês</Text>

      <TextInput
        label='Nome completo'
        value={nome}
        onChangeText={setNome}
        style={styles.input}
        autoCapitalize='words'
      />

      <TextInput
        label='E-mail'
        value={email}
        onChangeText={setEmail}
        keyboardType='email-address'
        style={styles.input}
        autoCapitalize='none'
      />

      {/* ======= Número do cartão ======= */}
      <TextInput
        label='Número do cartão'
        value={cartao}
        onChangeText={text => {
          const formatted = formatCardNumberLive(text);
          setCartao(formatted);
          if (onlyDigits(formatted).length === 16) validadeRef.current?.focus();
        }}
        keyboardType='number-pad'
        style={styles.input}
        placeholder='1234 5678 9012 3456'
        maxLength={19}
        returnKeyType='next'
      />

      {/* ======= Validade + CVV ======= */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TextInput
          ref={validadeRef}
          label='Validade (MM/AA)'
          value={validade}
          onChangeText={text => {
            const formatted = formatExpiryLive(text);
            setValidade(formatted);
            if (onlyDigits(formatted).length === 4) cvvRef.current?.focus();
          }}
          keyboardType='number-pad'
          style={[styles.input, { flex: 1 }]}
          placeholder='MM/AA'
          maxLength={5}
          returnKeyType='next'
        />
        <TextInput
          ref={cvvRef}
          label='CVV'
          value={cvv}
          onChangeText={text => setCvv(onlyDigits(text).slice(0, 4))}
          keyboardType='number-pad'
          style={[styles.input, { flex: 1 }]}
          placeholder='123'
          maxLength={4}
          returnKeyType='done'
        />
      </View>

      <Button
        mode='contained'
        onPress={handleAssinar}
        disabled={isLoading}
        buttonColor={theme.colors.primary}
        style={styles.botaoConfirmar}
      >
        {isLoading ? 'Processando...' : 'Confirmar Assinatura'}
      </Button>

      <Button
        mode='text'
        onPress={() => router.back()}
        style={styles.botaoVoltar}
      >
        Voltar
      </Button>
    </ScrollView>
  );
}
