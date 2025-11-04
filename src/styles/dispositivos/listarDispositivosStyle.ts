import { StyleSheet } from 'react-native';
import { MD3Theme } from 'react-native-paper';

export const listarDispositivosStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    titulo: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 16,
    },
    semDados: {
      textAlign: 'center',
      color: theme.colors.onBackground,
      marginTop: 40,
    },
    card: {
      marginBottom: 10,
      backgroundColor: theme.colors.surfaceVariant,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.secondary,
    },
    info: {
      color: theme.colors.onSurface,
      fontSize: 14,
    },
  });
