import { StyleSheet } from 'react-native';

export const filtroModalStyles = StyleSheet.create({
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignSelf: 'center',
    width: '85%',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1b5e20',
  },
  item: {
    paddingVertical: 12,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  textoItem: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});
