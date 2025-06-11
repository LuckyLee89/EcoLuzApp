import { supabase } from '@services/supabaseClient';
import { dashboardStyles as styles } from '@styles/dashboardStyles';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card } from 'react-native-paper';

type Consumo = { id: string; data: string; consumo_kwh: number };

export default function Dashboard() {
  const [dados, setDados] = useState<Consumo[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getUser();
      const user = session?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from('consumo')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      if (error) return console.error(error);
      const registros = data as Consumo[];
      setDados(registros);

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

      setTotal(totalMes);
    })();
  }, []);

  const ultimos = dados.slice(0, 30).reverse();
  const labels = ultimos.map(i =>
    new Date(i.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
  );
  const valores = ultimos.map(i => Number(i.consumo_kwh.toFixed(1)));
  const chartWidth = Math.max(
    Dimensions.get('window').width,
    valores.length * 60,
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Bem-vindo de volta ⚡</Text>
      <Text style={styles.subtitulo}>Resumo do consumo elétrico</Text>

      <View style={styles.cardTotal}>
        <Text style={styles.totalTexto}>Consumo total no mês:</Text>
        <Text style={styles.totalValor}>{total.toFixed(1)} kWh</Text>
      </View>

      {valores.length > 0 && (
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
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(27, 94, 32, ${opacity})`,
                labelColor: () => '#000',
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#2e7d32',
                },
              }}
              bezier
              style={{ borderRadius: 16, marginVertical: 12 }}
            />
          </View>
        </ScrollView>
      )}

      <Text style={styles.listaTitulo}>Últimos registros:</Text>

      {dados.slice(0, 10).map(item => (
        <Card key={item.id} style={styles.cardItem}>
          <Card.Content>
            <Text style={styles.data}>
              {new Date(item.data).toLocaleDateString()}
            </Text>
            <Text style={styles.consumo}>
              {item.consumo_kwh.toFixed(2)} kWh
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}
