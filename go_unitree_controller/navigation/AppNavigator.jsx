import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../config/theme';

// Screens — Auth
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Screens — App
import ConnectionScreen from '../screens/ConnectionScreen';
import MovementScreen from '../screens/MovementScreen';
import ActionsScreen from '../screens/ActionsScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createNativeStackNavigator();

// ─── Opciones de header globales ───────────────────────────────────────────────
const screenOptions = {
  headerStyle: { backgroundColor: colors.headerBg },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: 'bold' },
};

export default function AppNavigator() {
  const { user, loading } = useAuth();

  // Mientras se restaura la sesión desde SecureStore → spinner
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {user === null ? (
        // ── Stack de autenticación ──────────────────────────────────────────
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Crear cuenta' }}
          />
        </>
      ) : (
        // ── Stack de la app (requiere sesión activa) ────────────────────────
        <>
          <Stack.Screen
            name="Connection"
            component={ConnectionScreen}
            options={{ title: 'UniTree — Conexión' }}
          />
          <Stack.Screen
            name="Movement"
            component={MovementScreen}
            options={{ title: 'Control de movimiento' }}
          />
          <Stack.Screen
            name="Actions"
            component={ActionsScreen}
            options={{ title: 'Acciones del robot' }}
          />
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{ title: 'Historial de comandos' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
