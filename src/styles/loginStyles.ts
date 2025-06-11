import { StyleSheet } from 'react-native';

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f7f1',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#388e3c',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#1b5e20',
  },
  logo: {
    width: 240,
    height: 240,
    marginBottom: 20,
    alignSelf: 'center',
  },
});
