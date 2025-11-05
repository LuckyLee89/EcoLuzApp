import FiltroModal from '@components/FiltroModal';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '@services/supabaseClient';
import { criarHistoricoStyles } from '@styles/historicoStyles';
import { exportarPDFEscolha } from '@utils/pdfHelper';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

export type Consumo = {
  id: string;
  data: string;
  consumo_kwh: number;
  valor_kwh?: number;
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
  const theme = useTheme();
  const styles = criarHistoricoStyles(theme);

  useEffect(() => {
    if (isFocused) carregarDados();
  }, [isFocused]);

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
  ];

  const anosUnicos = [
    ...new Set(dados.map(i => new Date(i.data).getFullYear().toString())),
  ];
  const anos = ['Todos', ...anosUnicos];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>📅 Histórico de Consumo</Text>

      <View style={styles.filtros}>
        <Button mode='outlined' onPress={() => setModalMesVisivel(true)}>
          {filtroMes
            ? `Mês: ${meses.find(m => m.valor === filtroMes)?.nome}`
            : 'Filtrar por mês'}
        </Button>
        <Button
          mode='outlined'
          onPress={() => setModalAnoVisivel(true)}
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

      {dadosPaginados.map(item => {
        const custo = Number(item.consumo_kwh) * Number(item.valor_kwh || 0);
        return (
          <Card
            key={item.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/editar',
                params: {
                  id: item.id,
                  data: item.data,
                  consumo: item.consumo_kwh.toString(),
                  valor_kwh: item.valor_kwh ? String(item.valor_kwh) : '',
                },
              })
            }
          >
            <Card.Content>
              <Text style={styles.data}>
                {format(parseISO(item.data), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </Text>
              <Text style={styles.kwh}>
                ⚡ {item.consumo_kwh.toFixed(2)} kWh
              </Text>
              <Text style={styles.valor}>
                💰 R$ {item.valor_kwh?.toFixed(2) || '0,00'} /kWh
              </Text>
              <Text style={styles.custo}>Total: R$ {custo.toFixed(2)}</Text>
            </Card.Content>
          </Card>
        );
      })}

      <Button
        mode='outlined'
        onPress={() => exportarPDFEscolha(dadosFiltrados)}
        style={{ marginTop: 16 }}
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
        <Text style={styles.textoSecundario}>
          Todos os registros foram exibidos.
        </Text>
      )}

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
