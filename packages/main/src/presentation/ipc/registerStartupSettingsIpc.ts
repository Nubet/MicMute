import {ipcMain} from 'electron';
import {MICROPHONE_IPC_CHANNELS} from '@app/shared';
import type {StartupSettingsService} from '../../application/startup/StartupSettingsService.js';

export function registerStartupSettingsIpc(service: StartupSettingsService): void {
  ipcMain.handle(MICROPHONE_IPC_CHANNELS.getStartupSettings, async () => {
    return service.getSettings();
  });

  ipcMain.handle(MICROPHONE_IPC_CHANNELS.setStartupOpenAtLogin, async (_, enabled: boolean) => {
    return service.setOpenAtLogin(enabled);
  });
}
