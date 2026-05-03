import {sha256sum} from './nodeCrypto.js';
import {versions} from './versions.js';
import {ipcRenderer} from 'electron';
import {MICROPHONE_IPC_CHANNELS} from '@app/shared';

function send(channel: string, message: string) {
  return ipcRenderer.invoke(channel, message);
}

function getMicrophoneMuteState() {
  return ipcRenderer.invoke(MICROPHONE_IPC_CHANNELS.getMuteState);
}

function setMicrophoneMuteState(muted: boolean) {
  return ipcRenderer.invoke(MICROPHONE_IPC_CHANNELS.setMuteState, muted);
}

export {sha256sum, versions, send, getMicrophoneMuteState, setMicrophoneMuteState};
