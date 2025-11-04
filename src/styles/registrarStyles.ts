import { StyleSheet } from 'react-native';
import { MD3Theme } from 'react-native-paper';

export const criarRegistrarStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    titulo: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme.colors.primary,
    },
    input: {
      marginBottom: 16,
    },
    modal: {
      backgroundColor: theme.colors.surface,
      padding: 24,
      borderRadius: 16,
      elevation: 6,
      width: '85%',
      alignSelf: 'center',
    },
    modalTitulo: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
      color: theme.colors.primary,
      textAlign: 'center',
    },
    modalTexto: {
      fontSize: 15,
      color: theme.colors.onSurface,
      textAlign: 'center',
      marginBottom: 20,
    },
    botaoFechar: {
      width: '100%',
      backgroundColor: theme.colors.primary,
    },
  });
