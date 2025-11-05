import type { Consumo } from '@screens/Historico';
import { format, parseISO } from 'date-fns';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export function gerarHTML(dados: Consumo[]): string {
  return `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; font-size: 14px; }
        h1 { text-align: center; color: #1b5e20; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; border: 1px solid #ccc; text-align: left; }
        th { background-color: #1b5e20; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <h1>Histórico de Consumo e Gasto</h1>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Consumo (kWh)</th>
            <th>Valor kWh (R$)</th>
            <th>Gasto Total (R$)</th>
          </tr>
        </thead>
        <tbody>
          ${dados
            .map(item => {
              const custo =
                Number(item.consumo_kwh) * Number(item.valor_kwh || 0);
              return `
                <tr>
                  <td>${format(parseISO(item.data), 'dd/MM/yyyy')}</td>
                  <td>${item.consumo_kwh.toFixed(2)}</td>
                  <td>${item.valor_kwh?.toFixed(2) || '0,00'}</td>
                  <td>${custo.toFixed(2)}</td>
                </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </body>
  </html>
  `;
}

export async function salvarPDF(html: string): Promise<void> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Não foi possível salvar o PDF.');
      return;
    }

    const { uri } = await Print.printToFileAsync({ html });
    const nomeArquivo = `historico_consumo_${Date.now()}.pdf`;
    const novoCaminho = FileSystem.documentDirectory + nomeArquivo;

    await FileSystem.copyAsync({ from: uri, to: novoCaminho });
    const asset = await MediaLibrary.createAssetAsync(novoCaminho);
    const album = await MediaLibrary.getAlbumAsync('Download');
    if (album) await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    else await MediaLibrary.createAlbumAsync('Download', asset, false);

    Alert.alert('Sucesso', 'PDF salvo na pasta Downloads ✅');
  } catch (e) {
    console.error('[Salvar PDF] Erro:', e);
    Alert.alert('Erro', 'Falha ao salvar o PDF. Verifique permissões.');
  }
}

export async function compartilharPDF(html: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    Alert.alert('Compartilhamento indisponível');
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri);
}

export async function exportarPDFEscolha(dados: Consumo[]) {
  const html = gerarHTML(dados);
  Alert.alert(
    'Exportar Histórico',
    'Como deseja exportar seu histórico de consumo?',
    [
      { text: 'Salvar em PDF', onPress: () => salvarPDF(html) },
      { text: 'Compartilhar', onPress: () => compartilharPDF(html) },
      { text: 'Cancelar', style: 'cancel' },
    ],
  );
}
