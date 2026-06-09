import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRobot } from '../context/RobotContext';
import { borderRadius, colors, fontSizes, spacing } from '../config/theme';

// F1 — Pantalla de Conexión al robot
export default function ConnectionScreen({ navigation }) {
  const { logout, user } = useAuth();
  const { connect, disconnect, isConnected, loading, error, statusData, robotType } = useRobot();

  const [selectedType, setSelectedType] = useState('go2');

  async function handleConnect() {
    await connect(selectedType);
  }

  async function handleDisconnect() {
    await disconnect();
  }

  async function handleLogout() {
    await logout();
  }

  // Color de fondo del selector según tipo elegido
  const go2Selected = selectedType === 'go2';
  const g1Selected = selectedType === 'g1';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Usuario actual */}
      <Text style={styles.userLabel}>Sesión: {user?.username}</Text>

      {/* ──────── Selector tipo de robot ──────── */}
      <Text style={styles.sectionTitle}>Tipo de robot</Text>
      <View style={styles.robotSelector}>
        <TouchableOpacity
          style={[
            styles.robotButton,
            go2Selected ? styles.go2Selected : styles.robotButtonInactive,
          ]}
          onPress={() => setSelectedType('go2')}
          activeOpacity={0.8}
        >
          <Text style={[styles.robotIcon]}>🐕</Text>
          <Text
            style={[
              styles.robotButtonText,
              go2Selected ? styles.robotButtonTextSelected : styles.robotButtonTextInactive,
            ]}
          >
            Go2
          </Text>
          <Text
            style={[
              styles.robotTypeLabel,
              go2Selected ? styles.robotButtonTextSelected : styles.robotButtonTextInactive,
            ]}
          >
            Cuadrúpedo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.robotButton,
            g1Selected ? styles.g1Selected : styles.robotButtonInactive,
          ]}
          onPress={() => setSelectedType('g1')}
          activeOpacity={0.8}
        >
          <Text style={styles.robotIcon}>🤖</Text>
          <Text
            style={[
              styles.robotButtonText,
              g1Selected ? styles.robotButtonTextSelected : styles.robotButtonTextInactive,
            ]}
          >
            G1
          </Text>
          <Text
            style={[
              styles.robotTypeLabel,
              g1Selected ? styles.robotButtonTextSelected : styles.robotButtonTextInactive,
            ]}
          >
            Humanoide
          </Text>
        </TouchableOpacity>
      </View>

      {/* ──────── Botones de acción ──────── */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.connectButton,
          (loading || isConnected) && styles.buttonDisabled,
        ]}
        onPress={handleConnect}
        disabled={loading || isConnected}
        activeOpacity={0.8}
      >
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={styles.buttonText}>Conectar</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.disconnectButton,
          (loading || !isConnected) && styles.buttonDisabled,
        ]}
        onPress={handleDisconnect}
        disabled={loading || !isConnected}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Desconectar</Text>
      </TouchableOpacity>

      {/* ──────── Mensaje de error ──────── */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ──────── Navegación a otras pantallas ──────── */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navButton, !isConnected && styles.navButtonDisabled]}
          onPress={() => navigation.navigate('Movement')}
          disabled={!isConnected}
          activeOpacity={0.8}
        >
          <Text style={styles.navButtonText}>Movimiento</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, !isConnected && styles.navButtonDisabled]}
          onPress={() => navigation.navigate('Actions')}
          disabled={!isConnected}
          activeOpacity={0.8}
        >
          <Text style={styles.navButtonText}>Acciones</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('History')}
          activeOpacity={0.8}
        >
          <Text style={styles.navButtonText}>Historial</Text>
        </TouchableOpacity>
      </View>

      {/* ──────── Panel de diagnóstico ──────── */}
      <Text style={styles.sectionTitle}>Diagnóstico — GET /status</Text>
      <ScrollView
        style={styles.diagnosticsBox}
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        <Text style={styles.diagnosticsText}>
          {statusData
            ? JSON.stringify(statusData, null, 2)
            : 'Sin datos. Esperando respuesta del servidor...'}
        </Text>
      </ScrollView>

      {/* ──────── Cerrar sesión ──────── */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  userLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  // Selector de robot
  robotSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  robotButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  robotButtonInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  go2Selected: {
    backgroundColor: colors.go2Light,
    borderColor: colors.go2,
  },
  g1Selected: {
    backgroundColor: colors.g1Light,
    borderColor: colors.g1,
  },
  robotIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  robotButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  robotTypeLabel: {
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
  robotButtonTextSelected: {
    color: colors.text,
  },
  robotButtonTextInactive: {
    color: colors.textSecondary,
  },
  // Botones principales
  button: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  connectButton: {
    backgroundColor: colors.primary,
  },
  disconnectButton: {
    backgroundColor: colors.error,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  // Error
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  // Navegación
  navRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  navButton: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  // Diagnóstico
  diagnosticsBox: {
    backgroundColor: colors.headerBg,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    maxHeight: 200,
    marginBottom: spacing.md,
  },
  diagnosticsText: {
    color: '#A3E635',
    fontSize: fontSizes.xs,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  // Cerrar sesión
  logoutButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
    marginTop: spacing.sm,
  },
  logoutText: {
    color: colors.error,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});