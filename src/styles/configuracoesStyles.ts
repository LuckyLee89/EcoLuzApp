import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

export const useConfiguracoesStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    titulo: {
      fontSize: 24,
      marginBottom: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
    },
    label: {
      fontSize: 16,
      color: theme.colors.onBackground,
    },
    botao: {
      marginVertical: 8,
    },
    divisor: {
      marginVertical: 12,
    },
    info: {
      fontSize: 14,
      color: theme.colors.onBackground,
      marginBottom: 6,
      marginHorizontal: 8,
    },
  });
};
