import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../services/robotApi';

// ─── Contexto ────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

const TOKEN_KEY = 'unitree_jwt';
const USERNAME_KEY = 'unitree_username';

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { username, email }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true mientras restaura sesión

  // Al arrancar la app, intentar restaurar sesión desde SecureStore
  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const storedUsername = await SecureStore.getItemAsync(USERNAME_KEY);
      if (storedToken && storedUsername) {
        setToken(storedToken);
        setUser({ username: storedUsername });
      }
    } catch (error) {
      console.error('[AuthContext] Error restaurando sesión:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // F5 — Login con email e identifier
  async function login(email, password) {
    const response = await authApi.login(email, password);
    const { access_token } = response.data;

    await SecureStore.setItemAsync(TOKEN_KEY, access_token);
    await SecureStore.setItemAsync(USERNAME_KEY, email);

    setToken(access_token);
    setUser({ username: email, email });
  }

  // F6 — Registro
  async function register(username, email, password) {
    await authApi.register(username, email, password);
    // Después del registro el usuario debe hacer login manualmente
  }

  // Cerrar sesión — limpia SecureStore y estado
  async function logout() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USERNAME_KEY);
    } catch (error) {
      console.error('[AuthContext] Error limpiando sesión:', error.message);
    } finally {
      setToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook de acceso ────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
