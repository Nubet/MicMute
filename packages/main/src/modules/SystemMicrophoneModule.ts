import type {AppModule} from '../AppModule.js';
import {getSystemMicrophoneMuteService} from '../application/audio/getSystemMicrophoneMuteService.js';
import {registerMicrophoneMuteIpc} from '../presentation/ipc/registerMicrophoneMuteIpc.js';

class SystemMicrophoneModule implements AppModule {
  enable(): void {
    const muteService = getSystemMicrophoneMuteService();
    registerMicrophoneMuteIpc(muteService);
  }
}

export function systemMicrophoneModule() {
  return new SystemMicrophoneModule();
}
