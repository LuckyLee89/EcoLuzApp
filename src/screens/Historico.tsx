import FiltroModal from '@components/FiltroModal';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '@services/supabaseClient';
import { historicoStyles as styles } from '@styles/historicoStyles';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Print from 'expo-print';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

type Consumo = {
  id: string;
  data: string;
  consumo_kwh: number;
};

export default function HistoricoScreen() {
  const [dados, setDados] = useState<Consumo[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtroAno, setFiltroAno] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [modalMesVisivel, setModalMesVisivel] = useState(false);
  const [modalAnoVisivel, setModalAnoVisivel] = useState(false);
  const [itensPorPagina, setItensPorPagina] = useState(5);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      carregarDados();
    }
  }, [isFocused]);

  const exportarPDF = async (dados: Consumo[]) => {
    const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px;
            font-size: 14px;
          }
          h1 {
            text-align: center;
            color: #1b5e20;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            padding: 10px;
            border: 1px solid #ccc;
            text-align: left;
          }
          th {
            background-color: #1b5e20;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h1>Histórico de Consumo</h1>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Consumo (kWh)</th>
            </tr>
          </thead>
          <tbody>
            ${dados
              .map(
                item => `
                <tr>
                  <td>${format(parseISO(item.data), 'dd/MM/yyyy')}</td>
                  <td>${item.consumo_kwh.toFixed(2)}</td>
                </tr>
              `,
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  const carregarDados = async () => {
    const { data: session } = await supabase.auth.getUser();
    const user = session?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from('consumo')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false });

    if (!error && data) setDados(data as Consumo[]);
  };

  const limparFiltros = () => {
    setFiltroAno('');
    setFiltroMes('');
    setPaginaAtual(1);
  };

  const dadosFiltrados = dados.filter(item => {
    const data = parseISO(item.data);
    const ano = String(data.getFullYear());
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    return (
      (!filtroAno || filtroAno === ano) && (!filtroMes || filtroMes === mes)
    );
  });

  const dadosPaginados = dadosFiltrados.slice(0, paginaAtual * itensPorPagina);
  const podeCarregarMais = dadosFiltrados.length > dadosPaginados.length;

  const mesesUnicos = [
    ...new Set(
      dados.map(i =>
        (new Date(i.data).getMonth() + 1).toString().padStart(2, '0'),
      ),
    ),
  ];

  const anosUnicos = [
    ...new Set(dados.map(i => new Date(i.data).getFullYear().toString())),
  ];

  const meses = [
    { nome: 'Todos', valor: '' },
    { nome: 'Janeiro', valor: '01' },
    { nome: 'Fevereiro', valor: '02' },
    { nome: 'Março', valor: '03' },
    { nome: 'Abril', valor: '04' },
    { nome: 'Maio', valor: '05' },
    { nome: 'Junho', valor: '06' },
    { nome: 'Julho', valor: '07' },
    { nome: 'Agosto', valor: '08' },
    { nome: 'Setembro', valor: '09' },
    { nome: 'Outubro', valor: '10' },
    { nome: 'Novembro', valor: '11' },
    { nome: 'Dezembro', valor: '12' },
  ].filter(m => m.valor === '' || mesesUnicos.includes(m.valor));

  const anos = ['Todos', ...anosUnicos];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>📅 Histórico de Consumo</Text>

      <View style={styles.filtros}>
        <Button
          onPress={() => setModalMesVisivel(true)}
          mode='outlined'
          textColor='#1b5e20'
        >
          {filtroMes
            ? `Mês: ${meses.find(m => m.valor === filtroMes)?.nome}`
            : 'Filtrar por mês'}
        </Button>

        <Button
          onPress={() => setModalAnoVisivel(true)}
          mode='outlined'
          textColor='#1b5e20'
          style={{ marginLeft: 8 }}
        >
          {filtroAno ? `Ano: ${filtroAno}` : 'Filtrar por ano'}
        </Button>
      </View>

      {(filtroAno || filtroMes) && (
        <Button onPress={limparFiltros} style={styles.botaoLimpar}>
          Limpar filtro
        </Button>
      )}
      <View style={[styles.filtros, { marginTop: 12 }]}>
        <Button
          onPress={() =>
            setItensPorPagina(prev => (prev === 5 ? 10 : prev === 10 ? 20 : 5))
          }
          mode='outlined'
          textColor='#1b5e20'
        >
          Exibir: {itensPorPagina} por página
        </Button>

        <Text style={{ marginLeft: 12, alignSelf: 'center', color: '#555' }}>
          Exibindo {dadosPaginados.length} de {dadosFiltrados.length}
        </Text>
      </View>

      {dadosPaginados.map(item => (
        <Card
          key={item.id}
          style={styles.card}
          onPress={() => {
            console.log('Item clicado:', item);
            router.push({
              pathname: '/editar',
              params: {
                id: item.id,
                data: item.data,
                consumo: item.consumo_kwh.toString(),
              },
            });
          }}
        >
          <Card.Content>
            <Text style={styles.data}>
              {format(parseISO(item.data), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </Text>
            <Text style={styles.kwh}>{item.consumo_kwh.toFixed(2)} kWh</Text>
          </Card.Content>
        </Card>
      ))}

      <Button
        mode='outlined'
        onPress={() => exportarPDF(dadosFiltrados)}
        style={{ marginBottom: 12 }}
      >
        📄 Exportar PDF
      </Button>

      {podeCarregarMais ? (
        <Button
          onPress={() => setPaginaAtual(prev => prev + 1)}
          mode='contained'
          style={{ marginVertical: 16 }}
        >
          Carregar mais
        </Button>
      ) : (
        <Text
          style={{ textAlign: 'center', marginVertical: 16, color: '#666' }}
        >
          Todos os registros foram exibidos.
        </Text>
      )}

      <View style={{ height: 32 }} />

      <FiltroModal
        visivel={modalMesVisivel}
        onFechar={() => setModalMesVisivel(false)}
        titulo='Selecione o mês'
        opcoes={meses.map(m => ({ label: m.nome, value: m.valor }))}
        aoSelecionar={mes => {
          setFiltroMes(mes);
          setPaginaAtual(1);
        }}
      />

      <FiltroModal
        visivel={modalAnoVisivel}
        onFechar={() => setModalAnoVisivel(false)}
        titulo='Selecione o ano'
        opcoes={anos.map(a => ({
          label: a === 'Todos' ? 'Todos os anos' : a,
          value: a === 'Todos' ? '' : a,
        }))}
        aoSelecionar={ano => {
          setFiltroAno(ano);
          setPaginaAtual(1);
        }}
      />
    </ScrollView>
  );
}
