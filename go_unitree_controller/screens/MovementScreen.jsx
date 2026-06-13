import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRobot } from '../context/RobotContext';
import { robotApi } from '../services/robotApi';
import { saveCommandHistory } from '../database';
import { borderRadius, colors, DPAD_SPEED, fontSizes, MOVE_SENSITIVITY, spacing, YAW_SENSITIVITY, YAW_SPEED } from '../config/theme';
import VirtualJoystick from '../components/VirtualJoystick';

// F2 — Pantalla de Control de Movimiento
export default function MovementScreen() {
  const { user, token } = useAuth();
  const { isConnected, robotType } = useRobot();

  const [lastResult, setLastResult] = useState(null); // { ok: bool, msg: string }
  const [actionLoading, setActionLoading] = useState(false);

  // Estados de los toggles avanzados
  const [handstand, setHandstand] = useState(false);
  const [freebound, setFreebound] = useState(false);
  const [freeavoid, setFreeavoid] = useState(false);
  const [crossstep, setCrossstep] = useState(false);
  const [freejump, setFreejump] = useState(false);
  const [walkupright, setWalkupright] = useState(false);

  // ─── Utilidades ───────────────────────────────────────────────────────────

  function showResult(ok, msg) {
    setLastResult({ ok, msg });
    setTimeout(() => setLastResult(null), ok ? 1500 : 3000);
  }

  async function runCommand(label, apiCall, payload = {}, { silentSuccess = false, blockUi = false } = {}) {
    if (!isConnected || (blockUi && actionLoading)) return;
    if (blockUi) setActionLoading(true);
    try {
      await apiCall();
      if (!silentSuccess) showResult(true, label);
      await saveCommandHistory(user?.username, label, payload, true, null);
    } catch (err) {
      const msg = err.response?.data?.detail ?? err.message;
      showResult(false, msg);
      await saveCommandHistory(user?.username, label, payload, false, msg);
    } finally {
      if (blockUi) setActionLoading(false);
    }
  }

  // ─── Handlers de movimiento (joystick único: vx, vy, vyaw) ───────────────

  function handleMove(vx, vy, vyaw) {
    if (!isConnected || !token) return;
    robotApi.move(
      token,
      vx * MOVE_SENSITIVITY,
      vy * MOVE_SENSITIVITY,
      vyaw * YAW_SENSITIVITY,
    ).catch(() => {});
  }

  function handleJoystickRelease() {
    if (!isConnected || !token) return;
    robotApi.stop(token).catch(() => {});
  }

  async function handleDirection(label, vx, vy, vyaw) {
    await runCommand(label, () => robotApi.move(token, vx, vy, vyaw), { vx, vy, vyaw }, { silentSuccess: true });
  }

  // ─── Handlers de toggles ─────────────────────────────────────────────────

  async function handleToggle(label, currentVal, setter, apiCall) {
    const newVal = !currentVal;
    setter(newVal);
    await runCommand(
      `${label} ${newVal ? 'ON' : 'OFF'}`,
      () => apiCall(token, newVal),
      { enable: newVal },
      { silentSuccess: true, blockUi: true },
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!isConnected) {
    return (
      <View style={styles.disconnectedContainer}>
        <Text style={styles.disconnectedIcon}>⚠️</Text>
        <Text style={styles.disconnectedText}>Conectá el robot primero</Text>
        <Text style={styles.disconnectedSub}>Volvé a Conexión y presioná Conectar</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {lastResult && (
        <View
          style={[
            styles.toast,
            lastResult.ok ? styles.toastOk : styles.toastError,
          ]}
          pointerEvents="none"
        >
          <Text style={[styles.toastText, lastResult.ok ? styles.toastTextOk : styles.toastTextError]}>
            {lastResult.ok ? `✓ ${lastResult.msg}` : `✗ ${lastResult.msg}`}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >

      {/* ─── Controles direccionales ──────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Controles direccionales</Text>
      <View style={styles.dpadContainer}>
        <View style={styles.dpadBlock}>
          <TouchableOpacity
            style={[styles.dpadBtn, styles.dpadBtnYaw]}
            onPress={() => handleDirection('giro_izquierda', 0, 0, YAW_SPEED)}
            activeOpacity={0.7}
          >
            <Text style={styles.dpadText}>↺</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dpadBtn}
            onPress={() => handleDirection('move_adelante', DPAD_SPEED, 0, 0)}
            activeOpacity={0.7}
          >
            <Text style={styles.dpadText}>▲</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dpadBtn, styles.dpadBtnYaw]}
            onPress={() => handleDirection('giro_derecha', 0, 0, -YAW_SPEED)}
            activeOpacity={0.7}
          >
            <Text style={styles.dpadText}>↻</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dpadRow}>
          <TouchableOpacity
            style={styles.dpadBtn}
            onPress={() => handleDirection('move_izquierda', 0, DPAD_SPEED, 0)}
            activeOpacity={0.7}
          >
            <Text style={styles.dpadText}>◄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dpadBtn, styles.dpadStop]}
            onPress={() => runCommand('stop', () => robotApi.stop(token), {}, { silentSuccess: true })}
            activeOpacity={0.7}
          >
            <Text style={styles.dpadStopText}>■</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dpadBtn}
            onPress={() => handleDirection('move_derecha', 0, -DPAD_SPEED, 0)}
            activeOpacity={0.7}
          >
            <Text style={styles.dpadText}>►</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.dpadBtn}
          onPress={() => handleDirection('move_atras', -DPAD_SPEED, 0, 0)}
          activeOpacity={0.7}
        >
          <Text style={styles.dpadText}>▼</Text>
        </TouchableOpacity>

        <View style={styles.dpadLegend}>
          <Text style={styles.dpadLegendText}>↺↻ Giro (vyaw)</Text>
          <Text style={styles.dpadLegendText}>◄► Strafe (vy)</Text>
        </View>
      </View>

      {/* ─── Posturas ─────────────────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Posturas</Text>
      <View style={styles.postureRow}>
        <TouchableOpacity
          style={[styles.postureBtn, styles.postureBtnGreen]}
          onPress={() => runCommand('Pararse', () => robotApi.standUp(token), {}, { blockUi: true })}
          disabled={actionLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.postureBtnText}>Pararse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.postureBtn, styles.postureBtnAmber]}
          onPress={() => runCommand('Sentarse', () => robotApi.sitDown(token), {}, { blockUi: true })}
          disabled={actionLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.postureBtnText}>Sentarse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.postureBtn, styles.postureBtnRed]}
          onPress={() => runCommand('Damp', () => robotApi.damp(token), {}, { blockUi: true })}
          disabled={actionLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.postureBtnText}>Damp</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Modos avanzados ──────────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Modos avanzados</Text>
      <View style={styles.togglesContainer}>
        <ToggleRow
          label="Handstand"
          value={handstand}
          onToggle={() => handleToggle('handstand', handstand, setHandstand, robotApi.handstand)}
          disabled={actionLoading}
        />
        <ToggleRow
          label="Free Bound"
          value={freebound}
          onToggle={() => handleToggle('freebound', freebound, setFreebound, robotApi.freebound)}
          disabled={actionLoading}
        />
        <ToggleRow
          label="Free Avoid"
          value={freeavoid}
          onToggle={() => handleToggle('freeavoid', freeavoid, setFreeavoid, robotApi.freeavoid)}
          disabled={actionLoading}
        />
        <ToggleRow
          label="Cross Step"
          value={crossstep}
          onToggle={() => handleToggle('crossstep', crossstep, setCrossstep, robotApi.crossstep)}
          disabled={actionLoading}
        />
        <ToggleRow
          label="Free Jump"
          value={freejump}
          onToggle={() => handleToggle('freejump', freejump, setFreejump, robotApi.freejump)}
          disabled={actionLoading}
        />
        {robotType === 'g1' && (
          <ToggleRow
            label="Walk Upright (G1)"
            value={walkupright}
            onToggle={() => handleToggle('walkupright', walkupright, setWalkupright, robotApi.walkupright)}
            disabled={actionLoading}
          />
        )}
      </View>
      </ScrollView>

      <View style={styles.joystickDock}>
        <Text style={styles.joystickTitle}>Joystick</Text>
        <Text style={styles.joystickHint}>↑↓ vx · ↔ vy / vyaw</Text>
        <View style={styles.joystickContainer}>
          <VirtualJoystick
            onMove={handleMove}
            onRelease={handleJoystickRelease}
            disabled={actionLoading}
          />
        </View>
      </View>
    </View>
  );
}

// ─── Componente auxiliar ToggleRow ─────────────────────────────────────────────
function ToggleRow({ label, value, onToggle, disabled }) {
  return (
    <View style={toggleStyles.row}>
      <Text style={toggleStyles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? colors.white : colors.textSecondary}
      />
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
});

const styles = StyleSheet.create({
  // Estado desconectado
  disconnectedContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  disconnectedIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  disconnectedText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  disconnectedSub: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Pantalla principal
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  // Feedback (toast flotante, no mueve el layout)
  toast: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.md,
    right: spacing.md,
    zIndex: 10,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  toastOk: {
    backgroundColor: 'rgba(220, 252, 231, 0.95)',
  },
  toastError: {
    backgroundColor: 'rgba(254, 226, 226, 0.95)',
  },
  toastText: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  toastTextOk: {
    color: colors.connected,
  },
  toastTextError: {
    color: colors.error,
  },
  // D-Pad
  dpadContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dpadBlock: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  dpadRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  dpadBtn: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadBtnYaw: {
    backgroundColor: colors.connecting,
  },
  dpadStop: {
    backgroundColor: colors.error,
  },
  dpadText: {
    color: colors.white,
    fontSize: fontSizes.lg,
  },
  dpadStopText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  dpadLegend: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  dpadLegendText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  // Joystick (zona fija, fuera del scroll)
  joystickDock: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  joystickTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  joystickHint: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  joystickContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 170,
  },
  // Posturas
  postureRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  postureBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  postureBtnGreen: {
    backgroundColor: colors.connected,
  },
  postureBtnAmber: {
    backgroundColor: colors.connecting,
  },
  postureBtnRed: {
    backgroundColor: colors.error,
  },
  postureBtnText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
  },
  // Toggles
  togglesContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
});
