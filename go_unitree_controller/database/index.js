import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import CommandHistory from './models/CommandHistory';

// Adaptador SQLite usando expo-sqlite como driver
const adapter = new SQLiteAdapter({
  schema,
  dbName: 'unitreedb',
  onSetUpError: (error) => {
    console.error('[WatermelonDB] Error inicializando la base de datos:', error);
  },
});

// Instancia global de la base de datos
const database = new Database({
  adapter,
  modelClasses: [CommandHistory],
});

export default database;

// ─── Helpers para guardar y consultar historial ────────────────────────────────

/**
 * Guarda un comando ejecutado en el historial local.
 * @param {string} username - usuario autenticado
 * @param {string} action - nombre del comando (ej: 'move', 'standup', 'hello')
 * @param {object} payload - datos enviados a la API
 * @param {boolean} success - si la API respondió con éxito
 * @param {string|null} errorMessage - mensaje de error si falló
 */
export async function saveCommandHistory(username, action, payload, success, errorMessage = null) {
  await database.write(async () => {
    await database.get('command_history').create((record) => {
      record.username = username;
      record.action = action;
      record.payload = JSON.stringify(payload ?? {});
      record.success = success;
      record.errorMessage = errorMessage ?? '';
      record.executedAt = Date.now();
    });
  });
}

/**
 * Retorna todos los comandos del historial de un usuario, ordenados por fecha descendente.
 * @param {string} username
 * @returns {Promise<CommandHistory[]>}
 */
export async function getHistoryByUser(username) {
  const collection = database.get('command_history');
  return collection
    .query()
    .fetch()
    .then((records) =>
      records
        .filter((r) => r.username === username)
        .sort((a, b) => b.executedAt - a.executedAt)
    );
}
