import { StyleSheet } from 'react-native';
import { MD3Theme } from 'react-native-paper';

export const criarLoginStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: theme.colors.background, // tema claro/escuro
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      textAlign: 'center',
      color: theme.colors.onBackground,
      marginBottom: 32,
    },
    input: {
      marginBottom: 16,
    },
    button: {
      marginTop: 12,
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
    },
  });
