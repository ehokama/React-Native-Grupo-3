import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../config/theme';

// F2 — Pantalla de Control de Movimiento
// TODO: implementar controles direccionales, botones Detener/Pararse/Sentarse,
//       feedback visual por acción y joystick virtual
export default function MovementScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Control de movimiento</Text>
      <Text style={styles.subtitle}>Próximamente — F2</Text>
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
