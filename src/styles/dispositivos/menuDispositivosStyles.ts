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
      color: theme.colors.primary, // verde EcoLuz
      textAlign: 'center',
      marginBottom: 24,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    descricao: {
      color: '#333',
      textAlign: 'center',
      marginBottom: 20,
      fontSize: 15,
    },
    botao: {
      marginVertical: 8,
      borderRadius: 10,
    },
  });
