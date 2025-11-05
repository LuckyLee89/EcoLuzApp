import { StyleSheet } from 'react-native';
import { MD3Theme } from 'react-native-paper';

export const criarHistoricoStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    titulo: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme.colors.primary,
    },
    filtros: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },
    picker: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
    },
    botaoLimpar: {
      marginBottom: 16,
      alignSelf: 'flex-start',
    },
    card: {
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 8,
    },
    data: {
      fontSize: 15,
      color: theme.colors.onSurface,
    },
    kwh: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    paginacao: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 30,
      paddingHorizontal: 16,
    },
    numeroPagina: {
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    valor: {
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 2,
    },
    custo: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.tertiary || '#2e7d32',
    },
    textoSecundario: {
      color: theme.colors.onSurface,
      textAlign: 'center',
      marginVertical: 16,
    },
  });
