import { StyleSheet } from 'react-native';

export const historicoStyles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f1f1f1' },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1b5e20',
  },
  filtros: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  picker: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  botaoLimpar: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  data: {
    fontSize: 15,
    color: '#555',
  },
  kwh: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
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
    color: '#333',
  },
});
