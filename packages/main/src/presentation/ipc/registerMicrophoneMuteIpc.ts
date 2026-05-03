import {ipcMain} from 'electron';
import {MICROPHONE_IPC_CHANNELS} from '@app/shared';
import {SystemMicrophoneMuteService} from '../../application/audio/SystemMicrophoneMuteService.js';

export function registerMicrophoneMuteIpc(service: SystemMicrophoneMuteService): void {
  ipcMain.handle(MICROPHONE_IPC_CHANNELS.getMuteState, async () => {
    return service.getMuteState();
  });

  ipcMain.handle(MICROPHONE_IPC_CHANNELS.setMuteState, async (_, muted: boolean) => {
    return service.setMuteState(muted);
  });
}
