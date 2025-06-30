import { filtroModalStyles as styles } from '@styles/filtroModalStyles';
import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text } from 'react-native-paper';

type Opcao = { label: string; value: string };

interface FiltroModalProps {
  visivel: boolean;
  onFechar: () => void;
  opcoes: Opcao[];
  aoSelecionar: (valor: string) => void;
  titulo: string;
}

export default function FiltroModal({
  visivel,
  onFechar,
  opcoes,
  aoSelecionar,
  titulo,
}: FiltroModalProps) {
  return (
    <Portal>
      <Modal
        visible={visivel}
        onDismiss={onFechar}
        contentContainerStyle={styles.modal}
      >
        <Text style={styles.titulo}>{titulo}</Text>
        <ScrollView style={{ maxHeight: 300 }}>
          {opcoes.map(opcao => (
            <TouchableOpacity
              key={opcao.value}
              onPress={() => {
                aoSelecionar(opcao.value);
                onFechar();
              }}
              style={styles.item}
            >
              <Text style={styles.textoItem}>{opcao.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Modal>
    </Portal>
  );
}
