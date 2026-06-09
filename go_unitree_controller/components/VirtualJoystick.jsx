import { useRef, useState } from 'react';
import { PanResponder, Platform, StyleSheet, View } from 'react-native';
import { colors } from '../config/theme';

const OUTER_RADIUS = 75;   // Radio del círculo exterior (px)
const INNER_RADIUS = 30;   // Radio del mando interior (px)
const OUTER_SIZE = OUTER_RADIUS * 2;
const INNER_SIZE = INNER_RADIUS * 2;

/**
 * Joystick virtual con PanResponder.
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

        // Limitar el mando al interior del círculo exterior
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = OUTER_RADIUS - INNER_RADIUS;
        const clampedDist = Math.min(distance, maxDist);
        const angle = Math.atan2(dy, dx);

        const clampedX = Math.cos(angle) * clampedDist;
        const clampedY = Math.sin(angle) * clampedDist;

        setInnerPos({ x: clampedX, y: clampedY });

        // Normalizar a [-1, 1]
        const vx = -(clampedY / maxDist);  // hacia adelante = dy negativo = vx positivo
        const vy = -(clampedX / maxDist);  // izquierda = dx negativo = vy positivo
        const vyaw = 0;

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
      {/* Líneas guía */}
      <View style={styles.guideH} />
      <View style={styles.guideV} />

      {/* Mando interior */}
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
