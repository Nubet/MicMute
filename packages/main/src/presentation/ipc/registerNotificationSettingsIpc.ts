import {ipcMain} from 'electron';
import {MICROPHONE_IPC_CHANNELS} from '@app/shared';
import type {NotificationSettings} from '@app/shared';
import type {NotificationSettingsService} from '../../application/notifications/NotificationSettingsService.js';

export function registerNotificationSettingsIpc(service: NotificationSettingsService): void {
  ipcMain.handle(MICROPHONE_IPC_CHANNELS.getNotificationSettings, async () => {
    return service.getSettings();
  });

  ipcMain.handle(MICROPHONE_IPC_CHANNELS.updateNotificationSettings, async (_, patch: Partial<NotificationSettings>) => {
    return service.updateSettings(patch);
  });
}
