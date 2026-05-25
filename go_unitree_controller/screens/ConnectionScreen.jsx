import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../config/theme';

// F1 — Pantalla de Conexión al robot
// TODO: implementar selector robot_type, network_interface, botones conectar/desconectar,
//       indicador de estado, panel de diagnóstico y auto-reconexión
export default function ConnectionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conexión al robot</Text>
      <Text style={styles.subtitle}>Próximamente — F1</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
});
