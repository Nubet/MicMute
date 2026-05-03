import type {MicrophoneMutePort} from '../../domain/audio/MicrophoneMutePort.js';
import {LinuxMicrophoneMutePort} from './linux/LinuxMicrophoneMutePort.js';
import {UnsupportedMicrophoneMutePort} from './UnsupportedMicrophoneMutePort.js';
import {WindowsMicrophoneMutePort} from './windows/WindowsMicrophoneMutePort.js';

export function createMicrophoneMutePort(platform: NodeJS.Platform): MicrophoneMutePort {
  if (platform === 'win32') {
    return new WindowsMicrophoneMutePort();
  }

  if (platform === 'linux') {
    return new LinuxMicrophoneMutePort();
  }

  return new UnsupportedMicrophoneMutePort();
}
