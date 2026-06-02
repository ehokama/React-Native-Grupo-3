import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getHistoryByUser } from "../database";
import { borderRadius, colors, fontSizes, spacing } from "../config/theme";

// F7 - Pantalla de Historial persistente (WatermelonDB)
export default function HistoryScreen() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    if (!user?.username) return;
    setLoading(true);
    try {
      const data = await getHistoryByUser(user.username);
      setRecords(data);
    } catch (err) {
      console.error("[HistoryScreen] Error leyendo historial:", err.message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function formatDate(ts) {
    if (!ts) return "-";
    const d = new Date(ts);
    return d.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Usuario: <Text style={styles.headerBold}>{user?.username}</Text>
        </Text>
        <TouchableOpacity onPress={loadHistory} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>Actualizar</Text>
        </TouchableOpacity>
      </View>

      {records.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No hay comandos registrados aún.</Text>
          <Text style={styles.emptySubText}>
            Los comandos enviados al robot se guardan aquí automáticamente.
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: item.success
                      ? colors.connected
                      : colors.error,
                  },
                ]}
              />
              <View style={styles.itemContent}>
                <Text style={styles.itemAction}>{item.action}</Text>
                {item.errorMessage ? (
                  <Text style={styles.itemError}>{item.errorMessage}</Text>
                ) : null}
                <Text style={styles.itemTime}>
                  {formatDate(item.executedAt)}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  item.success ? styles.badgeOk : styles.badgeError,
                ]}
              >
                <Text style={styles.badgeText}>
                  {item.success ? "OK" : "Error"}
                </Text>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  headerBold: {
    fontWeight: "700",
    color: colors.text,
  },
  refreshBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
  },
  refreshText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: "600",
  },
  // Lista
  listContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
  },
  itemAction: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.text,
    textTransform: "capitalize",
  },
  itemError: {
    fontSize: fontSizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  itemTime: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  badgeOk: {
    backgroundColor: "#DCFCE7",
  },
  badgeError: {
    backgroundColor: "#FEE2E2",
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
    color: colors.text,
  },
  separator: {
    height: spacing.sm,
  },
  // Vacío
  emptyText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptySubText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
