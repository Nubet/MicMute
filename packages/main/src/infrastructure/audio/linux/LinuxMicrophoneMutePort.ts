import {execFile as execFileCallback} from 'node:child_process';
import {promisify} from 'node:util';
import type {MicrophoneMutePort} from '../../../domain/audio/MicrophoneMutePort.js';

const execFile = promisify(execFileCallback);

export class LinuxMicrophoneMutePort implements MicrophoneMutePort {
  async getMuteState(): Promise<boolean> {
    const {stdout} = await execFile('pactl', ['get-source-mute', '@DEFAULT_SOURCE@']);
    return stdout.toLowerCase().includes('yes');
  }

  async setMuteState(muted: boolean): Promise<boolean> {
    await execFile('pactl', ['set-source-mute', '@DEFAULT_SOURCE@', muted ? '1' : '0']);
    return this.getMuteState();
  }
}
