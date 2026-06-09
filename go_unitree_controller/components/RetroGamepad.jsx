import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, DPAD_SPEED, spacing } from '../config/theme';

const DPAD_BTN = 48;
const ACTION_BTN = 44;
const ACTION_GAP = 6;

function DpadBtn({ label, vx, vy, vyaw, onStart, onEnd, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.dpadBtn, disabled && styles.btnDisabled]}
      onPressIn={() => onStart(vx, vy, vyaw)}
      onPressOut={onEnd}
      activeOpacity={0.5}
      delayPressIn={0}
      disabled={disabled}
    >
      <Text style={styles.dpadArrow}>{label}</Text>
    </TouchableOpacity>
  );
}

function ActionBtn({ label, name, color, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionName} numberOfLines={1}>{name}</Text>
    </TouchableOpacity>
  );
}

/**
 * Controlador retro estilo 8-bit.
 * Props:
 *   onDirectionStart(vx, vy, vyaw) — al presionar una dirección (hold-to-move)
 *   onDirectionEnd()               — al soltar (envía stop)
 *   onStop()                       — botón STOP central
 *   actions: { top, left, right, bottom } — cada uno: { name, color, fn }
 *   disabled
 */
export default function RetroGamepad({
  onDirectionStart,
  onDirectionEnd,
  onStop,
  actions,
  disabled = false,
}) {
  return (
    <View style={styles.body}>

      {/* ── D-pad izquierdo ─────────────────────────────── */}
      <View style={styles.dpadZone}>
        <DpadBtn
          label="▲" vx={DPAD_SPEED} vy={0} vyaw={0}
          onStart={onDirectionStart} onEnd={onDirectionEnd} disabled={disabled}
        />
        <View style={styles.dpadRow}>
          <DpadBtn
            label="◄" vx={0} vy={DPAD_SPEED} vyaw={0}
            onStart={onDirectionStart} onEnd={onDirectionEnd} disabled={disabled}
          />
          <View style={styles.dpadCenter} />
          <DpadBtn
            label="►" vx={0} vy={-DPAD_SPEED} vyaw={0}
            onStart={onDirectionStart} onEnd={onDirectionEnd} disabled={disabled}
          />
        </View>
        <DpadBtn
          label="▼" vx={-DPAD_SPEED} vy={0} vyaw={0}
          onStart={onDirectionStart} onEnd={onDirectionEnd} disabled={disabled}
        />
      </View>

      {/* ── Botón STOP central ──────────────────────────── */}
      <View style={styles.centerZone}>
        <TouchableOpacity
          style={[styles.stopBtn, disabled && styles.btnDisabled]}
          onPress={onStop}
          activeOpacity={0.6}
          disabled={disabled}
        >
          <Text style={styles.stopIcon}>■</Text>
          <Text style={styles.stopLabel}>STOP</Text>
        </TouchableOpacity>
      </View>

      {/* ── Botones de acción (diamond) ──────────────────── */}
      <View style={styles.actionZone}>
        {/* X arriba (centrado) */}
        <View style={styles.actionCenterRow}>
          <ActionBtn
            label="X" name={actions.top.name} color={actions.top.color}
            onPress={actions.top.fn} disabled={disabled}
          />
        </View>
        {/* Y izquierda — A derecha */}
        <View style={styles.actionMidRow}>
          <ActionBtn
            label="Y" name={actions.left.name} color={actions.left.color}
            onPress={actions.left.fn} disabled={disabled}
          />
          <ActionBtn
            label="A" name={actions.right.name} color={actions.right.color}
            onPress={actions.right.fn} disabled={disabled}
          />
        </View>
        {/* B abajo (centrado) */}
        <View style={styles.actionCenterRow}>
          <ActionBtn
            label="B" name={actions.bottom.name} color={actions.bottom.color}
            onPress={actions.bottom.fn} disabled={disabled}
          />
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: '100%',
  },

  // ── D-pad ──────────────────────────────────────────────
  dpadZone: {
    alignItems: 'center',
    gap: 2,
  },
  dpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dpadBtn: {
    width: DPAD_BTN,
    height: DPAD_BTN,
    backgroundColor: '#2d2d4e',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a4a7a',
  },
  dpadCenter: {
    width: DPAD_BTN,
    height: DPAD_BTN,
    backgroundColor: '#16162a',
    borderRadius: 4,
  },
  dpadArrow: {
    color: '#b0b0d8',
    fontSize: 18,
  },

  // ── STOP ──────────────────────────────────────────────
  centerZone: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtn: {
    backgroundColor: '#7f1d1d',
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  stopIcon: {
    color: '#ef4444',
    fontSize: 16,
    lineHeight: 18,
  },
  stopLabel: {
    color: '#fca5a5',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 2,
  },

  // ── Action buttons diamond ─────────────────────────────
  actionZone: {
    alignItems: 'center',
    gap: ACTION_GAP,
  },
  actionCenterRow: {
    width: 2 * ACTION_BTN + ACTION_GAP,
    alignItems: 'center',
  },
  actionMidRow: {
    flexDirection: 'row',
    gap: ACTION_GAP,
  },
  actionBtn: {
    width: ACTION_BTN,
    height: ACTION_BTN,
    borderRadius: ACTION_BTN / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 5,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  actionName: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 6,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  btnDisabled: {
    opacity: 0.4,
  },
});
