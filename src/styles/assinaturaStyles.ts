import { StyleSheet } from 'react-native';
import { MD3Theme } from 'react-native-paper';

export const criarAssinaturaStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
    },
    titulo: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 12,
      color: theme.colors.primary,
      textAlign: 'center',
    },
    descricao: {
      fontSize: 16,
      color: theme.colors.onBackground,
      textAlign: 'center',
      marginBottom: 24,
    },
    beneficio: {
      fontSize: 15,
      marginBottom: 8,
      color: theme.colors.onBackground,
      textAlign: 'center',
    },
    botaoAssinar: {
      marginTop: 24,
      marginBottom: 12,
      backgroundColor: theme.colors.primary,
    },
    botaoVoltar: {
      alignSelf: 'center',
    },
  });
