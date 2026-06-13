import { useRef, useState } from 'react';
import { PanResponder, Platform, StyleSheet, View } from 'react-native';
import { colors } from '../config/theme';

const OUTER_RADIUS = 75;
const INNER_RADIUS = 30;
const OUTER_SIZE = OUTER_RADIUS * 2;
const INNER_SIZE = INNER_RADIUS * 2;

/**
 * Deriva vx, vy y vyaw desde la posición 2D del mando.
 * - Vertical  → vx (adelante / atrás)
 * - Horizontal → vy (strafe) o vyaw (giro) según inclinación
 *   · Solo izquierda/derecha → gira en el lugar (vyaw)
 *   · Diagonal / adelante     → strafe (vy) + algo de giro
 */
export function mapStickToVelocity(clampedX, clampedY, maxDist) {
  const nx = -(clampedX / maxDist);
  const ny = -(clampedY / maxDist);

  const absX = Math.abs(nx);
  const absY = Math.abs(ny);
  const strafeWeight = absY / (absX + absY + 0.0001);
  const rotateWeight = 1 - strafeWeight;

  return {
    vx: ny,
    vy: nx * strafeWeight,
    vyaw: nx * rotateWeight,
  };
}

/**
 * Joystick virtual con PanResponder — envía vx, vy y vyaw en un solo control.
 * Props:
 *   onMove(vx, vy, vyaw) — llamado continuamente mientras se arrastra
 *   onRelease()           — llamado al soltar
 *   onInteractionStart()  — opcional, al iniciar el gesto
 *   onInteractionEnd()    — opcional, al soltar o cancelar el gesto
 *   disabled              — deshabilita la interacción
 */
export default function VirtualJoystick({
  onMove,
  onRelease,
  onInteractionStart,
  onInteractionEnd,
  disabled = false,
}) {
  const [innerPos, setInnerPos] = useState({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onStartShouldSetPanResponderCapture: () => !disabled,
      onMoveShouldSetPanResponderCapture: () => !disabled,
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: () => {
        if (disabled) return;
        if (onInteractionStart) onInteractionStart();
      },

      onPanResponderMove: (_, gestureState) => {
        if (disabled) return;

        const { dx, dy } = gestureState;
        const maxDist = OUTER_RADIUS - INNER_RADIUS;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const clampedDist = Math.min(distance, maxDist);
        const angle = Math.atan2(dy, dx);

        const clampedX = Math.cos(angle) * clampedDist;
        const clampedY = Math.sin(angle) * clampedDist;

        setInnerPos({ x: clampedX, y: clampedY });

        const { vx, vy, vyaw } = mapStickToVelocity(clampedX, clampedY, maxDist);
        if (onMove) onMove(vx, vy, vyaw);
      },

      onPanResponderRelease: () => {
        setInnerPos({ x: 0, y: 0 });
        if (onRelease) onRelease();
        if (onInteractionEnd) onInteractionEnd();
      },

      onPanResponderTerminate: () => {
        setInnerPos({ x: 0, y: 0 });
        if (onRelease) onRelease();
        if (onInteractionEnd) onInteractionEnd();
      },
    })
  ).current;

  return (
    <View
      style={[styles.outer, disabled && styles.outerDisabled]}
      {...panResponder.panHandlers}
    >
      <View style={styles.guideH} />
      <View style={styles.guideV} />

      <View
        style={[
          styles.inner,
          {
            transform: [
              { translateX: innerPos.x },
              { translateY: innerPos.y },
            ],
          },
          disabled && styles.innerDisabled,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    borderRadius: OUTER_RADIUS,
    backgroundColor: 'rgba(26, 115, 232, 0.15)',
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { touchAction: 'none' } : {}),
  },
  outerDisabled: {
    borderColor: colors.border,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  guideH: {
    position: 'absolute',
    width: OUTER_SIZE - 16,
    height: 1,
    backgroundColor: 'rgba(26, 115, 232, 0.3)',
  },
  guideV: {
    position: 'absolute',
    width: 1,
    height: OUTER_SIZE - 16,
    backgroundColor: 'rgba(26, 115, 232, 0.3)',
  },
  inner: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_RADIUS,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  innerDisabled: {
    backgroundColor: colors.border,
  },
});
