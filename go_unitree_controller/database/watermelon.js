import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import CommandHistory from './models/CommandHistory';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'unitreedb',
  onSetUpError: (error) => {
    console.error('[WatermelonDB] Error inicializando la base de datos:', error);
  },
});

const database = new Database({
  adapter,
  modelClasses: [CommandHistory],
});

export default database;

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
