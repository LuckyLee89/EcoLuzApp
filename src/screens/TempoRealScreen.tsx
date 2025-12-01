import { useLeiturasTempoReal } from '@hooks/useLeiturasTempoReal';
import { supabase } from '@services/supabaseClient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Text,
  useTheme,
} from 'react-native-paper';

export default function TempoRealScreen() {
  const theme = useTheme();
  const [dispositivoId, setDispositivoId] = useState<string | null>(null);
  const [semDispositivo, setSemDispositivo] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) {
          setSemDispositivo(true);
          setCarregando(false);
          return;
        }

        const { data: disp, error } = await supabase
          .from('dispositivos')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
          .single();

        if (error || !disp?.id) {
          setSemDispositivo(true);
        } else {
          setDispositivoId(disp.id);
        }
      } catch {
        setSemDispositivo(true);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  // ✅ Hook atualizado com status e erro
  const {
    leituras,
    carregando: carregandoLeituras,
    online,
    erro,
  } = useLeiturasTempoReal(dispositivoId);

  // ======= Estado de carregamento inicial =======
  if (carregando || carregandoLeituras) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator animating color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.primary }}>
          Carregando leituras...
        </Text>
      </View>
    );
  }

  // ======= Nenhum dispositivo cadastrado =======
  if (semDispositivo) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 12 }}>
          🚫 Nenhum dispositivo cadastrado ainda.
        </Text>
        <Text style={{ textAlign: 'center', color: '#777', marginBottom: 20 }}>
          Registre um dispositivo físico (ESP32 + PZEM) para acompanhar o
          consumo em tempo real.
        </Text>
        <Button
          mode='contained'
          buttonColor={theme.colors.primary}
          onPress={() => router.push('/stack/register')}
        >
          Registrar dispositivo
        </Button>
      </View>
    );
  }

  // ======= Nenhuma leitura recebida =======
  if (!leituras) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: theme.colors.onSurface }}>
          📡 Dispositivo conectado, mas ainda sem leituras registradas.
        </Text>
        <Text style={{ marginTop: 6, color: '#777' }}>
          Aguarde o primeiro envio do sensor.
        </Text>
      </View>
    );
  }

  // ======= Leituras disponíveis =======
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text
        variant='headlineSmall'
        style={{
          textAlign: 'center',
          marginBottom: 16,
          color: theme.colors.primary,
        }}
      >
        ⚡ Acompanhamento em Tempo Real
      </Text>

      <Card style={{ marginBottom: 10 }}>
        <Card.Title
          title='Leituras do PZEM'
          subtitle={
            online ? '🟢 Sensor Online' : '🔴 Sensor Offline (sem heartbeat)'
          }
        />
        <Card.Content>
          {erro && (
            <Text style={{ color: 'red', marginBottom: 8 }}>⚠ {erro}</Text>
          )}
          <Text>Consumo acumulado: {leituras.energia_kwh?.toFixed(3)} kWh</Text>
          <Text>Tensão: {leituras.tensao_v?.toFixed(1)} V</Text>
          <Text>Corrente: {leituras.corrente_a?.toFixed(3)} A</Text>
          <Text>Potência: {leituras.potencia_w?.toFixed(1)} W</Text>
          <Text>Energia: {leituras.energia_kwh?.toFixed(3)} kWh</Text>
          <Text>Frequência: {leituras.frequencia_hz?.toFixed(2)} Hz</Text>
          <Text>Fator de Potência: {leituras.fator_potencia?.toFixed(3)}</Text>
          <Text style={{ marginTop: 10, color: '#888' }}>
            Atualizado em:{' '}
            {new Date(leituras.medido_em).toLocaleTimeString('pt-BR', {
              timeZone: 'America/Sao_Paulo',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
