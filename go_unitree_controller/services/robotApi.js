import axios from 'axios';
import { API_BASE_URL } from '../config/theme';

// ─── Cliente Axios base ────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor de request: log + inyección de token
client.interceptors.request.use(
  async (config) => {
    console.log(`[Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  async (error) => {
    console.error('[Request Error]', error.message);
    throw error;
  }
);

// Interceptor de response: log
client.interceptors.response.use(
  async (response) => {
    console.log(`[Response] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const status = error.response?.status ?? 'sin conexión';
    console.error(`[Response Error] ${status} - ${error.message}`);
    throw error;
  }
);

// Función utilitaria para adjuntar el token JWT a cada request
export function buildAuthHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

// ─── Auth endpoints (sin token) ───────────────────────────────────────────────
export const authApi = {
  register: (username, email, password) =>
    client.post('/auth/register', { username, email, password }),

  login: (identifier, password) =>
    client.post('/auth/token', { identifier, password }),
};

// ─── Robot endpoints (requieren token) ────────────────────────────────────────
export const robotApi = {
  // F1 — Conexión
  connect: (token, robotType, networkInterface = 'eth0') =>
    client.post('/connect', { robot_type: robotType, network_interface: networkInterface }, {
      headers: buildAuthHeaders(token),
    }),

  disconnect: (token) =>
    client.post('/disconnect', {}, {
      headers: buildAuthHeaders(token),
    }),

  getStatus: (token) =>
    client.get('/status', {
      headers: buildAuthHeaders(token),
    }),

  // F2 — Movimiento
  move: (token, vx, vy, vyaw) =>
    client.post('/move', { vx, vy, vyaw }, {
      headers: buildAuthHeaders(token),
    }),

  stop: (token) =>
    client.post('/stop', {}, {
      headers: buildAuthHeaders(token),
    }),

  standUp: (token) =>
    client.post('/standup', {}, {
      headers: buildAuthHeaders(token),
    }),

  sitDown: (token) =>
    client.post('/sitdown', {}, {
      headers: buildAuthHeaders(token),
    }),

  damp: (token) =>
    client.post('/damp', {}, {
      headers: buildAuthHeaders(token),
    }),

  handstand: (token, enable) =>
    client.post('/handstand', { enable }, {
      headers: buildAuthHeaders(token),
    }),

  freebound: (token, enable) =>
    client.post('/freebound', { enable }, {
      headers: buildAuthHeaders(token),
    }),

  freeavoid: (token, enable) =>
    client.post('/freeavoid', { enable }, {
      headers: buildAuthHeaders(token),
    }),

  walkupright: (token, enable) =>
    client.post('/walkupright', { enable }, {
      headers: buildAuthHeaders(token),
    }),

  crossstep: (token, enable) =>
    client.post('/crossstep', { enable }, {
      headers: buildAuthHeaders(token),
    }),

  freejump: (token, enable) =>
    client.post('/freejump', { enable }, {
      headers: buildAuthHeaders(token),
    }),

  // F3 — Acciones
  getActions: (token) =>
    client.get('/actions', {
      headers: buildAuthHeaders(token),
    }),

  executeAction: (token, actionName) =>
    client.post(`/action/${actionName}`, {}, {
      headers: buildAuthHeaders(token),
    }),
};
