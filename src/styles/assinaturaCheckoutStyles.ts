// src/styles/assinaturaCheckoutStyles.ts
import { StyleSheet } from 'react-native';
import { MD3Theme } from 'react-native-paper';

export const criarAssinaturaCheckoutStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 24,
      backgroundColor: theme.colors.background,
    },
    titulo: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitulo: {
      fontSize: 16,
      color: theme.colors.onBackground,
      textAlign: 'center',
      marginBottom: 20,
    },
    input: {
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
    },
    botaoConfirmar: {
      marginTop: 12,
      paddingVertical: 6,
      borderRadius: 10,
    },
    botaoVoltar: {
      marginTop: 8,
      alignSelf: 'center',
    },
  });
