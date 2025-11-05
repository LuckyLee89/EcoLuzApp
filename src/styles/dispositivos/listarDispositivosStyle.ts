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
      color: theme.colors.primary, // verde principal
      marginBottom: 20,
      textAlign: 'center',
    },
    semDados: {
      textAlign: 'center',
      color: '#777',
      marginTop: 40,
    },
    card: {
      marginBottom: 14,
      backgroundColor: theme.colors.surface, // tom mais claro, harmônico com o verde
      borderRadius: 12,
      borderLeftWidth: 5,
      borderLeftColor: theme.colors.primary, // verde principal
      padding: 16,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    info: {
      color: '#333',
      fontSize: 14,
    },
    labelData: {
      color: '#666',
      marginTop: 6,
      fontSize: 13,
    },
  });
