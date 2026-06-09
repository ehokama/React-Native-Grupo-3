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
import { borderRadius, colors, DPAD_SPEED, fontSizes, MOVE_SENSITIVITY, spacing } from '../config/theme';
import VirtualJoystick from '../components/VirtualJoystick';
import RetroGamepad from '../components/RetroGamepad';

// F2 — Pantalla de Control de Movimiento
export default function MovementScreen() {
  const { user, token } = useAuth();
  const { isConnected, robotType } = useRobot();

  const [lastResult, setLastResult] = useState(null); // { ok: bool, msg: string }
  const [actionLoading, setActionLoading] = useState(false);
  const [controlMode, setControlMode] = useState('joystick'); // 'joystick' | 'retro'

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

  // ─── Handlers de movimiento ───────────────────────────────────────────────

  function handleMove(vx, vy, vyaw) {
    if (!isConnected || !token) return;
    robotApi.move(
      token,
      vx * MOVE_SENSITIVITY,
      vy * MOVE_SENSITIVITY,
      vyaw * MOVE_SENSITIVITY,
    ).catch(() => {});
  }

  function handleJoystickRelease() {
    if (!isConnected || !token) return;
    robotApi.stop(token).catch(() => {});
  }

  async function handleDirection(label, vx, vy, vyaw) {
    await runCommand(label, () => robotApi.move(token, vx, vy, vyaw), { vx, vy, vyaw }, { silentSuccess: true });
  }

  // ─── Handlers del modo retro ──────────────────────────────────────────────

  function handleRetroStart(vx, vy, vyaw) {
    if (!isConnected || !token) return;
    robotApi.move(token, vx, vy, vyaw).catch(() => {});
  }

  function handleRetroEnd() {
    if (!isConnected || !token) return;
    robotApi.stop(token).catch(() => {});
  }

  // Acciones asignadas a los botones XYAB del gamepad retro
  const retroActions = {
    top:    { name: 'Salto',    color: '#4a90d9', fn: () => runCommand('Salto',    () => robotApi.executeAction(token, 'jump'), {}, { blockUi: true }) },
    left:   { name: 'Saludo',   color: '#d4a017', fn: () => runCommand('Saludo',   () => robotApi.executeAction(token, 'wave'), {}, { blockUi: true }) },
    right:  { name: 'Pararse',  color: '#22C55E', fn: () => runCommand('Pararse',  () => robotApi.standUp(token),               {}, { blockUi: true }) },
    bottom: { name: 'Sentarse', color: '#EF4444', fn: () => runCommand('Sentarse', () => robotApi.sitDown(token),               {}, { blockUi: true }) },
  };

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

        {/* ─── Controles direccionales (solo en modo joystick) ──────────── */}
        {controlMode === 'joystick' && (
          <>
            <Text style={styles.sectionTitle}>Controles direccionales</Text>
            <View style={styles.dpadContainer}>
              <TouchableOpacity
                style={styles.dpadBtn}
                onPress={() => handleDirection('move_adelante', DPAD_SPEED, 0, 0)}
                activeOpacity={0.7}
              >
                <Text style={styles.dpadText}>▲</Text>
              </TouchableOpacity>

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
            </View>

            {/* ─── Posturas (solo en modo joystick) ─────────────────────── */}
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
          </>
        )}

        {/* ─── Modos avanzados (siempre visibles) ───────────────────────── */}
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

      {/* ─── Dock inferior con toggle de modo ────────────────────────────── */}
      <View style={styles.joystickDock}>

        {/* Toggle pill */}
        <View style={styles.modePill}>
          <TouchableOpacity
            style={[styles.modePillBtn, controlMode === 'joystick' && styles.modePillBtnActive]}
            onPress={() => setControlMode('joystick')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modePillText, controlMode === 'joystick' && styles.modePillTextActive]}>
              🕹 Joystick
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modePillBtn, controlMode === 'retro' && styles.modePillBtnActive]}
            onPress={() => setControlMode('retro')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modePillText, controlMode === 'retro' && styles.modePillTextActive]}>
              🎮 Retro
            </Text>
          </TouchableOpacity>
        </View>

        {/* Controlador activo */}
        <View style={styles.controllerContainer}>
          {controlMode === 'joystick' ? (
            <VirtualJoystick
              onMove={handleMove}
              onRelease={handleJoystickRelease}
              disabled={actionLoading}
            />
          ) : (
            <RetroGamepad
              onDirectionStart={handleRetroStart}
              onDirectionEnd={handleRetroEnd}
              onStop={() => runCommand('stop', () => robotApi.stop(token), {}, { silentSuccess: true })}
              actions={retroActions}
              disabled={actionLoading}
            />
          )}
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
  // Feedback (toast flotante)
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
  // Dock inferior
  joystickDock: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  // Toggle pill
  modePill: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  modePillBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  modePillBtnActive: {
    backgroundColor: colors.primary,
  },
  modePillText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modePillTextActive: {
    color: colors.white,
  },
  // Contenedor del controlador activo
  controllerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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
