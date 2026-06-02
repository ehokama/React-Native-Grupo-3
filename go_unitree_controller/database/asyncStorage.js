import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@unitree_command_history';

async function readAll() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeAll(records) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export async function saveCommandHistory(username, action, payload, success, errorMessage = null) {
  const records = await readAll();
  records.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    username,
    action,
    payload: JSON.stringify(payload ?? {}),
    success,
    errorMessage: errorMessage ?? '',
    executedAt: Date.now(),
  });
  await writeAll(records);
}

export async function getHistoryByUser(username) {
  const records = await readAll();
  return records
    .filter((r) => r.username === username)
    .sort((a, b) => b.executedAt - a.executedAt);
}
