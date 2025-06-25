import { assinaturaStyles as styles } from '@styles/assinaturaStyles';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function AssinaturaScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>✨ Versão Premium</Text>
      <Text style={styles.descricao}>
        Conecte sua conta com dispositivos inteligentes e registre
        automaticamente seu consumo. Ganhe tempo e evite erros.
      </Text>

      <Text style={styles.beneficio}>✅ Registro automático com Tuya</Text>
      <Text style={styles.beneficio}>✅ Acompanhamento em tempo real</Text>
      <Text style={styles.beneficio}>✅ Sem erros manuais</Text>

      <Button
        mode='contained'
        style={styles.botaoAssinar}
        onPress={() => alert('Simulação: Redirecionar para pagamento')}
      >
        Assinar agora
      </Button>

      <Button
        mode='text'
        style={styles.botaoVoltar}
        onPress={() => router.back()}
      >
        Voltar
      </Button>
    </View>
  );
}
