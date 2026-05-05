import {BrowserWindow} from 'electron';
import {MICROPHONE_IPC_CHANNELS} from '@app/shared';
import type {AppModule} from '../AppModule.js';
import type {ModuleContext} from '../ModuleContext.js';
import {getMicrophoneMuteStateCoordinator} from '../application/audio/getMicrophoneMuteStateCoordinator.js';
import {registerMicrophoneMuteIpc} from '../presentation/ipc/registerMicrophoneMuteIpc.js';

class SystemMicrophoneModule implements AppModule {
  async enable({app}: ModuleContext): Promise<void> {
    const coordinator = getMicrophoneMuteStateCoordinator();
    await coordinator.initialize();

    registerMicrophoneMuteIpc(coordinator);

    const unsubscribe = coordinator.subscribe((muted) => {
      for (const window of BrowserWindow.getAllWindows()) {
        if (!window.isDestroyed()) {
          window.webContents.send(MICROPHONE_IPC_CHANNELS.muteStateChanged, muted);
        }
      }
    });

    app.on('before-quit', () => {
      unsubscribe();
      coordinator.dispose();
    });
  }
}

export function systemMicrophoneModule() {
  return new SystemMicrophoneModule();
}
