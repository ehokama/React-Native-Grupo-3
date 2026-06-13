// Paleta de colores UniTree — nunca usar valores hardcodeados en los componentes
export const colors = {
  // Primarios
  primary: '#1A73E8',
  primaryDark: '#0D47A1',
  primaryLight: '#E8F0FE',

  // Secundarios (Go2 vs G1)
  go2: '#1A73E8',        // azul — cuadrúpedo
  go2Light: '#E8F0FE',
  g1: '#9C27B0',         // violeta — humanoide
  g1Light: '#F3E5F5',

  // Fondos
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F4FF',

  // Textos
  text: '#1C1C1E',
  textSecondary: '#6B7280',
  textOnPrimary: '#FFFFFF',

  // Estado de conexión
  connected: '#22C55E',
  disconnected: '#EF4444',
  connecting: '#F59E0B',

  // UI general
  border: '#E5E7EB',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  white: '#FFFFFF',
  black: '#000000',

  // Header
  headerBg: '#0D1B2A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
};

// URL base de la API (Railway deploy / local dev)
export const API_BASE_URL = 'http://localhost:8000';

// Velocidad lineal (vx/vy enviados al backend, rango efectivo ±1)
export const DPAD_BASE_SPEED = 0.5;
export const MOVE_SENSITIVITY = 0.75; // 25% más lento que la base
export const DPAD_SPEED = DPAD_BASE_SPEED * MOVE_SENSITIVITY;

// Velocidad angular (vyaw, rad/s efectivo — misma estructura que vx/vy)
export const YAW_BASE_SPEED = 0.5;
export const YAW_SENSITIVITY = 0.75;
export const YAW_SPEED = YAW_BASE_SPEED * YAW_SENSITIVITY;
