import { StyleSheet } from 'react-native';

export const registrarStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1b5e20',
  },
  input: {
    marginBottom: 16,
  },

  modal: {
    backgroundColor: '#fff',
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
    color: '#1b5e20',
    textAlign: 'center',
  },
  modalTexto: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
  },
  botaoFechar: {
    width: '100%',
    backgroundColor: '#1b5e20',
  },
});
