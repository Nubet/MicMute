import {globalShortcut} from 'electron';
import type {AppModule} from '../AppModule.js';
import type {ModuleContext} from '../ModuleContext.js';
import {getMicrophoneToggleShortcutService} from '../application/audio/getMicrophoneToggleShortcutService.js';
import {registerMicrophoneShortcutIpc} from '../presentation/ipc/registerMicrophoneShortcutIpc.js';

class MicrophoneShortcutModule implements AppModule {
  async enable({app}: ModuleContext): Promise<void> {
    await app.whenReady();

    const service = getMicrophoneToggleShortcutService();
    await service.initialize();
    registerMicrophoneShortcutIpc(service);

    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
    });
  }
}

export function microphoneShortcutModule() {
  return new MicrophoneShortcutModule();
}
