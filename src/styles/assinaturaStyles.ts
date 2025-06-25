import { StyleSheet } from 'react-native';

export const assinaturaStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1b5e20',
    textAlign: 'center',
  },
  descricao: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 24,
  },
  beneficio: {
    fontSize: 15,
    marginBottom: 8,
    color: '#333',
  },
  botaoAssinar: {
    marginTop: 24,
    marginBottom: 12,
    backgroundColor: '#1b5e20',
  },
  botaoVoltar: {
    alignSelf: 'center',
  },
});
