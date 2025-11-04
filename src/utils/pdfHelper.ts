// utils/pdfHelper.ts
import { format, parseISO } from 'date-fns';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

import type { Consumo } from '@screens/Historico';

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
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Histórico de Consumo</h1>
        <table>
          <thead>
            <tr><th>Data</th><th>Consumo (kWh)</th></tr>
          </thead>
          <tbody>
            ${dados
              .map(
                item => `
              <tr>
                <td>${format(parseISO(item.data), 'dd/MM/yyyy')}</td>
                <td>${item.consumo_kwh.toFixed(2)}</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

/*Versão antiga que usava FileSystem para salvar o PDF, mas não funcionava bem no Android
export async function salvarPDF(html: string): Promise<void> {
  try {
    const { uri } = await Print.printToFileAsync({ html });
    const nomeArquivo = `historico_consumo_${Date.now()}.pdf`;
    const novoCaminho = FileSystem.documentDirectory + nomeArquivo;

    await FileSystem.copyAsync({ from: uri, to: novoCaminho });

    Alert.alert(
      'PDF salvo com sucesso ✅',
      `Arquivo salvo em:\n${novoCaminho}\n\nCopie esse caminho para abrir com um app gerenciador de arquivos.`
    );
  } catch (e) {
    console.error('[Salvar PDF] Erro ao salvar:', e);
    Alert.alert('Erro', 'Falha ao salvar o PDF. Verifique permissões.');
  }
}
*/

export async function salvarPDF(html: string): Promise<void> {
  try {
    // Solicita permissão para acessar a mídia
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Não foi possível salvar o PDF.');
      return;
    }

    // Gera o arquivo PDF
    const { uri } = await Print.printToFileAsync({ html });
    const nomeArquivo = `historico_consumo_${Date.now()}.pdf`;
    const novoCaminho = FileSystem.documentDirectory + nomeArquivo;

    // Copia o arquivo PDF para o diretório de documentos
    await FileSystem.copyAsync({ from: uri, to: novoCaminho });

    // Cria um asset de mídia a partir do arquivo PDF
    const asset = await MediaLibrary.createAssetAsync(novoCaminho);

    // Verifica se o álbum "Download" existe
    const album = await MediaLibrary.getAlbumAsync('Download');
    if (album) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    } else {
      await MediaLibrary.createAlbumAsync('Download', asset, false);
    }

    Alert.alert('Sucesso', 'PDF salvo na pasta Downloads ✅');
  } catch (e) {
    console.error('[Salvar PDF] Erro ao salvar:', e);
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
      {
        text: 'Salvar em PDF',
        onPress: () => salvarPDF(html),
      },
      {
        text: 'Compartilhar',
        onPress: () => compartilharPDF(html),
      },
      { text: 'Cancelar', style: 'cancel' },
    ],
  );
}
