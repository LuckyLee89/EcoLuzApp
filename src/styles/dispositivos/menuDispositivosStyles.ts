import { StyleSheet } from 'react-native';
import { MD3Theme } from 'react-native-paper';

export const menuDispositivosStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 24,
      justifyContent: 'center',
    },
    titulo: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 24,
    },
    card: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 16,
    },
    descricao: {
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: 16,
      fontSize: 15,
    },
    botao: {
      marginVertical: 8,
      borderRadius: 8,
    },
  });
