import {ipcMain} from 'electron';
import {MICROPHONE_IPC_CHANNELS} from '@app/shared';
import {MicrophoneMuteStateCoordinator} from '../../application/audio/MicrophoneMuteStateCoordinator.js';

export function registerMicrophoneMuteIpc(coordinator: MicrophoneMuteStateCoordinator): void {
  ipcMain.handle(MICROPHONE_IPC_CHANNELS.getMuteState, async () => {
    return coordinator.getState();
  });

  ipcMain.handle(MICROPHONE_IPC_CHANNELS.setMuteState, async (_, muted: boolean) => {
    return coordinator.setState(muted);
  });

  ipcMain.handle(MICROPHONE_IPC_CHANNELS.toggleMuteState, async () => {
    return coordinator.toggleState();
  });
}
