import { verificarAssinaturaAtiva } from '@services/assinaturaService';
import { supabase } from '@services/supabaseClient';
import { criarAssinaturaStyles } from '@styles/assinaturaStyles';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';

export default function AssinaturaScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = criarAssinaturaStyles(theme);
  const [assinaturaAtiva, setAssinaturaAtiva] = useState<boolean | null>(null);

  useEffect(() => {
    async function carregarAssinatura() {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      if (!userId) {
        setAssinaturaAtiva(false);
        return;
      }
      const ativa = await verificarAssinaturaAtiva(userId);
      setAssinaturaAtiva(ativa);
    }
    carregarAssinatura();
  }, []);

  if (assinaturaAtiva === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {assinaturaAtiva ? (
        <>
          <Text style={styles.titulo}>🌟 Plano Premium Ativo</Text>
          <Text style={styles.descricao}>
            Obrigado por apoiar o EcoLuz! Agora você tem acesso total ao
            monitoramento automático via sensores ESP32 + PZEM e aos gráficos em
            tempo real.
          </Text>

          <Button
            mode='contained'
            style={styles.botaoAssinar}
            onPress={() => router.push('/(tabs)/dispositivos')}
          >
            Ir para Dispositivos
          </Button>
        </>
      ) : (
        <>
          <Text style={styles.titulo}>⚡ Versão Premium</Text>
          <Text style={styles.descricao}>
            Desbloqueie o modo automático do EcoLuz e veja seus dados em tempo
            real, direto dos sensores conectados a sua casa.
          </Text>

          <Text style={styles.beneficio}>
            ✅ Monitoramento via ESP32 + PZEM
          </Text>
          <Text style={styles.beneficio}>✅ Leitura em tempo real</Text>
          <Text style={styles.beneficio}>
            ✅ Relatórios e histórico automáticos
          </Text>
          <Text style={styles.beneficio}>✅ Backup seguro no Supabase</Text>

          <Button
            mode='contained'
            style={styles.botaoAssinar}
            onPress={() => router.push('/assinatura/checkout')}
          >
            Assinar agora
          </Button>
        </>
      )}

      <Button
        mode='text'
        style={styles.botaoVoltar}
        onPress={() => router.back()}
        textColor={theme.colors.primary}
      >
        Voltar
      </Button>
    </View>
  );
}
