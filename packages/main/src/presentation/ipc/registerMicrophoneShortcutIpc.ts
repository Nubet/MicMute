import {ipcMain} from 'electron';
import {MICROPHONE_IPC_CHANNELS} from '@app/shared';
import {MicrophoneToggleShortcutService} from '../../application/audio/MicrophoneToggleShortcutService.js';

export function registerMicrophoneShortcutIpc(service: MicrophoneToggleShortcutService): void {
  ipcMain.handle(MICROPHONE_IPC_CHANNELS.getToggleShortcut, async () => {
    return service.getShortcut();
  });

  ipcMain.handle(MICROPHONE_IPC_CHANNELS.setToggleShortcut, async (_, accelerator: string | null) => {
    return service.setShortcut(accelerator);
  });
}
