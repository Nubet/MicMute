import {createMicrophoneMutePort} from '../../infrastructure/audio/createMicrophoneMutePort.js';
import {SystemMicrophoneMuteService} from './SystemMicrophoneMuteService.js';

let instance: SystemMicrophoneMuteService | null = null;

export function getSystemMicrophoneMuteService(): SystemMicrophoneMuteService {
  if (instance) {
    return instance;
  }

  instance = new SystemMicrophoneMuteService(createMicrophoneMutePort(process.platform));
  return instance;
}
