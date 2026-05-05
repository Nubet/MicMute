import {NotificationSettingsService} from './NotificationSettingsService.js';

let instance: NotificationSettingsService | null = null;

export function getNotificationSettingsService(): NotificationSettingsService {
  if (instance) {
    return instance;
  }

  instance = new NotificationSettingsService();
  return instance;
}
