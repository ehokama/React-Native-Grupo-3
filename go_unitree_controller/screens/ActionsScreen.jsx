import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useRobot } from "../context/RobotContext";
import { robotApi } from "../services/robotApi";
import { saveCommandHistory } from "../database";
import { borderRadius, colors, fontSizes, spacing } from "../config/theme";

// F3 - Pantalla de Acciones del robot
export default function ActionsScreen() {
  const { user, token } = useAuth();
  const { isConnected } = useRobot();

  const [actions, setActions] = useState([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [executingAction, setExecutingAction] = useState(null); // nombre de la acción en curso
  const [lastResult, setLastResult] = useState(null); // { ok: bool, msg: string }
  const [sessionHistory, setSessionHistory] = useState([]); // historial de esta sesión

  // Cargar acciones al montar o cuando cambia el estado de conexión
  useEffect(() => {
    if (isConnected && token) {
      loadActions();
    } else {
      setActions([]);
    }
  }, [isConnected, token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadActions() {
    setLoadingActions(true);
    try {
      const res = await robotApi.getActions(token);
      setActions(res.data?.actions ?? res.data ?? []);
    } catch (err) {
      console.error("[ActionsScreen] Error cargando acciones:", err.message);
      setActions([]);
    } finally {
      setLoadingActions(false);
    }
  }

  async function executeAction(actionName) {
    if (!isConnected || executingAction) return;
    setExecutingAction(actionName);
    setLastResult(null);

    const timestamp = new Date();
    let ok = false;
    let errorMsg = null;

    try {
      await robotApi.executeAction(token, actionName);
      ok = true;
      showResult(true, `${actionName} ejecutada`);
    } catch (err) {
      errorMsg = err.response?.data?.detail ?? err.message;
      showResult(false, errorMsg);
    } finally {
      setExecutingAction(null);
    }

    // Agregar al historial de sesión
    setSessionHistory((prev) => [
      { action: actionName, ok, errorMsg, timestamp },
      ...prev,
    ]);

    // Persistir en WatermelonDB
    await saveCommandHistory(
      user?.username,
      `action_${actionName}`,
      {},
      ok,
      errorMsg,
    );
  }

  function showResult(ok, msg) {
    setLastResult({ ok, msg });
    setTimeout(() => setLastResult(null), 3000);
  }

  // --- Render ---

  if (!isConnected) {
    return (
      <View style={styles.disconnectedContainer}>
        <Text style={styles.disconnectedIcon}>⚠️</Text>
        <Text style={styles.disconnectedText}>Conectá el robot primero</Text>
        <Text style={styles.disconnectedSub}>
          Volvé a Conexión y presioná Conectar
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* --- Feedback visual --- */}
      {lastResult && (
        <View
          style={[
            styles.resultBanner,
            lastResult.ok ? styles.resultOk : styles.resultError,
          ]}
        >
          <Text style={styles.resultText}>
            {lastResult.ok ? "✓ " : "✗ "}
            {lastResult.msg}
          </Text>
        </View>
      )}

      {/* --- Grilla de acciones --- */}
      <Text style={styles.sectionTitle}>Acciones disponibles</Text>

      {loadingActions ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : actions.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            No hay acciones disponibles para este robot.
          </Text>
        </View>
      ) : (
        <FlatList
          data={actions}
          keyExtractor={(item) => item}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ActionButton
              name={item}
              isExecuting={executingAction === item}
              disabled={executingAction !== null}
              onPress={() => executeAction(item)}
            />
          )}
          scrollEnabled={false}
        />
      )}

      {/* --- Historial de sesión --- */}
      <Text style={styles.sectionTitle}>Historial de esta sesión</Text>

      {sessionHistory.length === 0 ? (
        <Text style={styles.emptyText}>Aún no ejecutaste ninguna acción.</Text>
      ) : (
        <FlatList
          data={sessionHistory}
          keyExtractor={(_, idx) => String(idx)}
          style={styles.historyList}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View
                style={[
                  styles.historyDot,
                  {
                    backgroundColor: item.ok ? colors.connected : colors.error,
                  },
                ]}
              />
              <View style={styles.historyContent}>
                <Text style={styles.historyAction}>{item.action}</Text>
                {item.errorMsg && (
                  <Text style={styles.historyError}>{item.errorMsg}</Text>
                )}
              </View>
              <Text style={styles.historyTime}>
                {item.timestamp.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

// --- Componente auxiliar ActionButton ---
function ActionButton({ name, isExecuting, disabled, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,
        disabled && !isExecuting && styles.actionBtnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      {isExecuting ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <Text style={styles.actionBtnText}>{name}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  // Estado desconectado
  disconnectedContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  disconnectedIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  disconnectedText: {
    fontSize: fontSizes.lg,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  disconnectedSub: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  // Sección
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  // Feedback
  resultBanner: {
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  resultOk: { backgroundColor: "#DCFCE7" },
  resultError: { backgroundColor: "#FEE2E2" },
  resultText: {
    fontSize: fontSizes.sm,
    color: colors.text,
    textAlign: "center",
    fontWeight: "600",
  },
  loader: {
    marginTop: spacing.lg,
  },
  // Grilla de acciones
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  columnWrapper: {
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  actionBtnText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: "600",
    textAlign: "center",
    textTransform: "capitalize",
  },
  // Vacío
  emptyBox: {
    padding: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    textAlign: "center",
  },
  // Historial de sesión
  historyList: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  historyContent: {
    flex: 1,
  },
  historyAction: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.text,
    textTransform: "capitalize",
  },
  historyError: {
    fontSize: fontSizes.xs,
    color: colors.error,
  },
  historyTime: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
});
