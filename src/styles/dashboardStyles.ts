import { StyleSheet } from 'react-native';

export const dashboardStyles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f1f1f1' },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 4,
  },
  subtitulo: { fontSize: 14, color: '#555', marginBottom: 16 },
  cardTotal: {
    backgroundColor: '#c8e6c9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  totalTexto: { fontSize: 16, color: '#2e7d32' },
  totalValor: { fontSize: 24, fontWeight: 'bold', color: '#1b5e20' },
  listaTitulo: { fontSize: 16, marginBottom: 8, color: '#333' },
  cardItem: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  data: { fontSize: 14, color: '#777' },
  consumo: { fontSize: 18, fontWeight: 'bold', color: '#333' },
});
