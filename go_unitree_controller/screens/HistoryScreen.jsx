import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../config/theme';

// F7 — Pantalla de Historial persistente
// TODO: leer CommandHistory de WatermelonDB filtrado por usuario activo,
//       mostrar acción, resultado y timestamp de cada entrada
export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de comandos</Text>
      <Text style={styles.subtitle}>Próximamente — F7</Text>
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
