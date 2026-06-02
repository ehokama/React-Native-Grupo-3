import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { robotApi } from '../services/robotApi';
import { useAuth } from './AuthContext';

// ─── Contexto ─────────────────────────────────────────────────────────────────
const RobotContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function RobotProvider({ children }) {
  const { user, token } = useAuth();

  const [robotType, setRobotType] = useState('go2');
  const [isConnected, setIsConnected] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastConnectParams, setLastConnectParams] = useState(null);

  const pollingRef = useRef(null);
  const isReconnectingRef = useRef(false);

  // Inicia / detiene el polling de status según si hay sesión activa
  useEffect(() => {
    if (!user || !token) {
      clearInterval(pollingRef.current);
      setIsConnected(false);
      setStatusData(null);
      setLastConnectParams(null);
      return;
    }

    // Chequeo inicial inmediato
    refreshStatus();

    pollingRef.current = setInterval(() => {
      refreshStatus();
    }, 5000);

    return () => clearInterval(pollingRef.current);
  }, [user, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-reconexión: si el status muestra desconectado y tenemos params guardados
  useEffect(() => {
    if (
      statusData !== null &&
      statusData.connection_state !== 'connected' &&
      lastConnectParams !== null &&
      !isReconnectingRef.current &&
      !loading
    ) {
      autoReconnect();
    }
  }, [statusData]); // eslint-disable-line react-hooks/exhaustive-deps

  async function refreshStatus() {
    if (!token) return;
    try {
      const res = await robotApi.getStatus(token);
      setStatusData(res.data);
      setIsConnected(res.data?.connection_state === 'connected');
    } catch (err) {
      console.error('[RobotContext] Error obteniendo status:', err.message);
    }
  }

  async function connect(type, networkInterface = 'eth0') {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await robotApi.connect(token, type, networkInterface);
      setRobotType(type);
      setLastConnectParams({ type, networkInterface });
      setIsConnected(true);
      await refreshStatus();
    } catch (err) {
      const code = err.response?.data?.error;
      if (code === 'ALREADY_CONNECTED') {
        setIsConnected(true);
        setError(null);
        await refreshStatus();
        return;
      }
      const msg = err.response?.data?.detail ?? err.response?.data?.error ?? err.message;
      setError(msg);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await robotApi.disconnect(token);
      setIsConnected(false);
      setLastConnectParams(null);
      await refreshStatus();
    } catch (err) {
      const msg = err.response?.data?.detail ?? err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function autoReconnect() {
    if (!lastConnectParams || isReconnectingRef.current) return;
    isReconnectingRef.current = true;
    console.log('[RobotContext] Auto-reconectando con params anteriores...');
    try {
      await connect(lastConnectParams.type, lastConnectParams.networkInterface);
    } finally {
      isReconnectingRef.current = false;
    }
  }

  return (
    <RobotContext.Provider
      value={{
        robotType,
        isConnected,
        statusData,
        loading,
        error,
        lastConnectParams,
        connect,
        disconnect,
        refreshStatus,
      }}
    >
      {children}
    </RobotContext.Provider>
  );
}

// ─── Hook de acceso ────────────────────────────────────────────────────────────
export function useRobot() {
  const ctx = useContext(RobotContext);
  if (!ctx) {
    throw new Error('useRobot debe usarse dentro de un RobotProvider');
  }
  return ctx;
}
