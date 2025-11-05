import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@services/supabaseClient';
import { criarDashboardStyles } from '@styles/dashboardStyles';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import {
  ActivityIndicator,
  Card,
  IconButton,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

type Consumo = {
  id: string;
  data: string;
  consumo_kwh: number;
  valor_kwh?: number;
  custo_estimado?: number;
};

export default function DashboardScreen() {
  const theme = useTheme();
  const styles = criarDashboardStyles(theme);

  const [dados, setDados] = useState<Consumo[]>([]);
  const [total, setTotal] = useState(0);
  const [totalGasto, setTotalGasto] = useState(0);
  const [totalAcumulado, setTotalAcumulado] = useState(0);
  const [leituraInicial, setLeituraInicial] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getUser();
      const user = session?.user;
      if (!user) return;

      // 🔹 Busca registros de consumo
      const { data, error } = await supabase
        .from('consumo')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao carregar dados:', error.message);
        return;
      }

      const registros = data as Consumo[];
      setDados(registros);

      // 🔹 Busca leitura inicial no Supabase
      const { data: leituraInicialData } = await supabase
        .from('leitura_inicial')
        .select('leitura_kwh')
        .eq('user_id', user.id)
        .single();

      const leituraBase = leituraInicialData?.leitura_kwh ?? 0;
      setLeituraInicial(leituraBase);

      // 🔹 Consumo total acumulado (desde o início)
      const totalAcumulado = registros.reduce(
        (sum, i) => sum + Number(i.consumo_kwh),
        0,
      );
      setTotalAcumulado(totalAcumulado);

      // 🔹 Totais mensais
      const hoje = new Date();
      const totalMes = registros
        .filter(i => {
          const d = new Date(i.data);
          return (
            d.getMonth() === hoje.getMonth() &&
            d.getFullYear() === hoje.getFullYear()
          );
        })
        .reduce((sum, i) => sum + Number(i.consumo_kwh), 0);

      const totalGastoMes = registros
        .filter(i => {
          const d = new Date(i.data);
          return (
            d.getMonth() === hoje.getMonth() &&
            d.getFullYear() === hoje.getFullYear()
          );
        })
        .reduce(
          (sum, i) => sum + Number(i.consumo_kwh) * Number(i.valor_kwh || 0),
          0,
        );

      setTotal(totalMes);
      setTotalGasto(totalGastoMes);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  // ==========================================================
  // 🔹 FILTRO E GRÁFICOS — MÊS ATUAL
  // ==========================================================
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();

  const dadosMesAtual = dados.filter(i => {
    const d = new Date(i.data);
    return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
  });

  dadosMesAtual.sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime(),
  );

  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const ultimos = dadosMesAtual.slice(-diasNoMes);

  const labels = ultimos.map(i =>
    new Date(i.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
  );
  const valores = ultimos.map(i => Number(i.consumo_kwh.toFixed(1)));
  const custos = ultimos.map(
    i => Number(i.consumo_kwh) * Number(i.valor_kwh || 0),
  );

  const chartWidth = Math.max(
    Dimensions.get('window').width,
    valores.length * 60,
  );

  // ==========================================================
  // 🔹 INTERFACE
  // ==========================================================
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      <Text style={styles.titulo}>Bem-vindo de volta ⚡</Text>
      <Text style={styles.subtitulo}>Resumo do consumo elétrico</Text>

      {/* ====== Card total ====== */}
      <View style={styles.cardTotal}>
        <Text style={styles.totalTexto}>Consumo total no mês:</Text>
        <Text style={styles.totalValor}>{total.toFixed(1)} kWh</Text>

        <View style={{ height: 8 }} />

        <Text style={styles.totalTexto}>💰 Gasto estimado no mês:</Text>
        <Text
          style={[
            styles.totalValor,
            { color: theme.colors.tertiary || '#2e7d32' },
          ]}
        >
          R$ {totalGasto.toFixed(2)}
        </Text>

        {leituraInicial !== null && (
          <>
            <View style={{ height: 12 }} />
            <Text style={styles.totalTexto}>🔸 Desde o início:</Text>
            <Text style={styles.totalValor}>
              {totalAcumulado.toFixed(1)} kWh
            </Text>
          </>
        )}
      </View>

      {/* ====== Gráfico de consumo ====== */}
      {valores.length > 0 && (
        <>
          <Text style={styles.listaTitulo}>Gráfico de consumo (kWh)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: chartWidth }}>
              <LineChart
                data={{
                  labels,
                  datasets: [{ data: valores }],
                }}
                width={chartWidth}
                height={260}
                yAxisSuffix=' kWh'
                fromZero
                chartConfig={{
                  backgroundGradientFrom: theme.colors.background,
                  backgroundGradientTo: theme.colors.background,
                  decimalPlaces: 1,
                  color: (opacity = 1) =>
                    theme.colors.primary +
                    Math.round(opacity * 255).toString(16),
                  labelColor: () => theme.colors.onBackground,
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: theme.colors.primary,
                  },
                }}
                bezier
                style={{
                  borderRadius: 16,
                  marginVertical: 12,
                  paddingRight: 70,
                  paddingTop: 10,
                }}
              />
            </View>
          </ScrollView>

          {/* ====== Gráfico de gasto ====== */}
          <Text style={styles.listaTitulo}>Gráfico de gasto (R$)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: chartWidth }}>
              <LineChart
                data={{
                  labels,
                  datasets: [{ data: custos }],
                }}
                width={chartWidth}
                height={260}
                yAxisSuffix=' R$'
                fromZero
                chartConfig={{
                  backgroundGradientFrom: theme.colors.background,
                  backgroundGradientTo: theme.colors.background,
                  decimalPlaces: 2,
                  color: (opacity = 1) =>
                    theme.colors.tertiary
                      ? theme.colors.tertiary +
                        Math.round(opacity * 255).toString(16)
                      : '#2e7d32',
                  labelColor: () => theme.colors.onBackground,
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: theme.colors.tertiary || theme.colors.primary,
                  },
                }}
                bezier
                style={{
                  borderRadius: 16,
                  marginVertical: 12,
                  paddingRight: 70,
                  paddingTop: 10,
                }}
              />
            </View>
          </ScrollView>
        </>
      )}

      {/* ====== Lista ====== */}
      <Text style={styles.listaTitulo}>Últimos registros:</Text>

      {dadosMesAtual.slice(0, 10).map(item => (
        <TouchableRipple
          key={item.id}
          rippleColor='rgba(0,0,0,0.1)'
          borderless={false}
          onPress={() =>
            router.push({
              pathname: '/editar',
              params: {
                id: item.id,
                data: item.data,
                consumo: String(item.consumo_kwh),
                valor_kwh: item.valor_kwh ? String(item.valor_kwh) : '',
              },
            })
          }
        >
          <Card style={styles.cardItem}>
            <Card.Content
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text style={styles.data}>
                  {new Date(item.data).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Text>

                <Text
                  style={{
                    color: theme.colors.primary,
                    fontWeight: 'bold',
                    fontSize: 16,
                  }}
                >
                  ⚡ {item.consumo_kwh.toFixed(2)} kWh
                </Text>

                <Text style={{ color: '#666', fontSize: 14 }}>
                  💰 R$ {item.valor_kwh?.toFixed(2) || '0,00'} /kWh
                </Text>

                <Text
                  style={{
                    color: theme.colors.tertiary || '#b33',
                    fontWeight: 'bold',
                    fontSize: 15,
                  }}
                >
                  Total: R$ {(item.custo_estimado ?? 0).toFixed(2)}
                </Text>
              </View>

              <IconButton icon='pencil-outline' size={22} />
            </Card.Content>
          </Card>
        </TouchableRipple>
      ))}
    </ScrollView>
  );
}
