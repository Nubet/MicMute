import type {AppModule} from '../AppModule.js';
import {SystemMicrophoneMuteService} from '../application/audio/SystemMicrophoneMuteService.js';
import {createMicrophoneMutePort} from '../infrastructure/audio/createMicrophoneMutePort.js';
import {registerMicrophoneMuteIpc} from '../presentation/ipc/registerMicrophoneMuteIpc.js';

class SystemMicrophoneModule implements AppModule {
  enable(): void {
    const mutePort = createMicrophoneMutePort(process.platform);
    const muteService = new SystemMicrophoneMuteService(mutePort);
    registerMicrophoneMuteIpc(muteService);
  }
}

export function systemMicrophoneModule() {
  return new SystemMicrophoneModule();
}
