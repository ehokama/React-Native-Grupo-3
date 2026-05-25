import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../config/theme';

// F3 — Pantalla de Acciones del robot
// TODO: cargar acciones con GET /actions, mostrar como grilla de botones,
//       ejecutar con POST /action/{name}, feedback visual e historial de comandos
export default function ActionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acciones del robot</Text>
      <Text style={styles.subtitle}>Próximamente — F3</Text>
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
