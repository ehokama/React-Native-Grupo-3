import { appSchema, tableSchema } from '@nozbe/watermelondb';

// Esquema de la base de datos local (WatermelonDB + expo-sqlite)
export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'command_history',
      columns: [
        { name: 'username', type: 'string' },       // usuario que ejecutó el comando
        { name: 'action', type: 'string' },          // ej: "move", "standup", "hello"
        { name: 'payload', type: 'string' },         // JSON stringificado del payload enviado
        { name: 'success', type: 'boolean' },        // si la API respondió OK
        { name: 'error_message', type: 'string', isOptional: true }, // mensaje de error si hubo
        { name: 'executed_at', type: 'number' },     // timestamp Unix (ms)
      ],
    }),
  ],
});
