import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

// Modelo WatermelonDB para el historial de comandos enviados al robot
export default class CommandHistory extends Model {
  static table = 'command_history';

  @field('username') username;
  @field('action') action;
  @field('payload') payload;
  @field('success') success;
  @field('error_message') errorMessage;
  @field('executed_at') executedAt;
}
