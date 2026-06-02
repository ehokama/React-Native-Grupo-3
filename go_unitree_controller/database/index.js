import { NativeModules } from 'react-native';
import * as asyncStorageDb from './asyncStorage';

const useWatermelon = !!NativeModules.WMDatabaseBridge;

let watermelonDb = null;

function getWatermelonDb() {
  if (!watermelonDb) {
    watermelonDb = require('./watermelon');
  }
  return watermelonDb;
}

export async function saveCommandHistory(username, action, payload, success, errorMessage = null) {
  if (useWatermelon) {
    return getWatermelonDb().saveCommandHistory(username, action, payload, success, errorMessage);
  }
  return asyncStorageDb.saveCommandHistory(username, action, payload, success, errorMessage);
}

export async function getHistoryByUser(username) {
  if (useWatermelon) {
    return getWatermelonDb().getHistoryByUser(username);
  }
  return asyncStorageDb.getHistoryByUser(username);
}
