import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const EcoLuzLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1b5e', // verde
    secondary: '#ffb300', // amarelo
    background: '#ffffff',
    surface: '#f1f1f1',
    onPrimary: '#ffffff',
    onSecondary: '#000000',
  },
};

export const EcoLuzDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#1b5e',
    secondary: '#ffb300',
    background: '#121212',
    surface: '#1e1e1e',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
  },
};
