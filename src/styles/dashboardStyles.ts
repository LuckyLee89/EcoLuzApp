import { StyleSheet } from 'react-native';
import { MD3Theme } from 'react-native-paper';

export const criarDashboardStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    titulo: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    subtitulo: {
      fontSize: 14,
      color: theme.colors.onBackground,
      marginBottom: 16,
    },
    cardTotal: {
      backgroundColor: theme.colors.elevation.level2,
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
    },

    totalTexto: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    totalValor: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    listaTitulo: {
      fontSize: 16,
      marginBottom: 8,
      color: theme.colors.onBackground,
    },
    cardItem: {
      marginBottom: 10,
      backgroundColor: theme.colors.surface,
    },
    data: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    consumo: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
  });
