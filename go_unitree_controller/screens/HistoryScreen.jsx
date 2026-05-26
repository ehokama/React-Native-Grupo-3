import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../config/theme';
import useHistory from '../hooks/useHistory';

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const date = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return `${date} ${time}`;
}

function HistoryItem({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.action}>{item.action}</Text>
        <View style={[styles.badge, item.success ? styles.badgeSuccess : styles.badgeError]}>
          <Text style={styles.badgeText}>{item.success ? 'OK' : 'Error'}</Text>
        </View>
      </View>
      {item.payload && item.payload !== '{}' && (
        <Text style={styles.payload} numberOfLines={2}>{item.payload}</Text>
      )}
      {!item.success && item.errorMessage ? (
        <Text style={styles.errorMsg} numberOfLines={2}>{item.errorMessage}</Text>
      ) : null}
      <Text style={styles.timestamp}>{formatDate(item.executedAt)}</Text>
    </View>
  );
}

export default function HistoryScreen() {
  const { history, loading, error, refresh } = useHistory();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error al cargar el historial</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryItem item={item} />}
        contentContainerStyle={history.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No hay comandos registrados aún.</Text>
            <Text style={styles.emptySubtext}>Los comandos enviados al robot aparecerán aquí.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  action: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeSuccess: {
    backgroundColor: colors.success,
  },
  badgeError: {
    backgroundColor: colors.error,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.white,
  },
  payload: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontFamily: 'monospace',
  },
  errorMsg: {
    fontSize: fontSizes.sm,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: spacing.sm,
  },
  errorDetail: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
