import {MicrophoneMuteStateCoordinator} from './MicrophoneMuteStateCoordinator.js';
import {getSystemMicrophoneMuteService} from './getSystemMicrophoneMuteService.js';

let instance: MicrophoneMuteStateCoordinator | null = null;

export function getMicrophoneMuteStateCoordinator(): MicrophoneMuteStateCoordinator {
  if (instance) {
    return instance;
  }

  instance = new MicrophoneMuteStateCoordinator(getSystemMicrophoneMuteService());
  return instance;
}
