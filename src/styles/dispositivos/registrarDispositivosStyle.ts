import { StyleSheet } from 'react-native';
import { MD3Theme } from 'react-native-paper';

export const registrarDispositivosStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    titulo: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 20,
    },
    input: {
      marginBottom: 12,
    },
    botao: {
      marginTop: 8,
      borderRadius: 8,
    },
    cardChave: {
      backgroundColor: theme.colors.surfaceVariant,
      borderColor: theme.colors.secondary,
      borderWidth: 1,
      borderRadius: 10,
      marginTop: 20,
    },
    chaveTitulo: {
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    chave: {
      fontFamily: 'monospace',
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    chaveHint: {
      marginTop: 6,
      color: theme.colors.onSurfaceVariant,
      fontSize: 13,
    },
  });
