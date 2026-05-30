import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../config/theme';
import { useRobot } from '../context/RobotContext';

// Indicador de estado de conexión del robot — se usa en el header de cada pantalla autenticada
export default function StatusBadge() {
  const { isConnected, loading } = useRobot();

  let dotColor;
  let label;

  if (loading) {
    dotColor = colors.connecting;
    label = 'Conectando...';
  } else if (isConnected) {
    dotColor = colors.connected;
    label = 'Conectado';
  } else {
    dotColor = colors.disconnected;
    label = 'Desconectado';
  }

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  label: {
    fontSize: fontSizes.xs,
    color: colors.white,
    fontWeight: '600',
  },
});
