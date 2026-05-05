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

function getMicrophoneToggleShortcut() {
  return ipcRenderer.invoke(MICROPHONE_IPC_CHANNELS.getToggleShortcut);
}

function setMicrophoneToggleShortcut(accelerator: string | null) {
  return ipcRenderer.invoke(MICROPHONE_IPC_CHANNELS.setToggleShortcut, accelerator);
}

export {
  sha256sum,
  versions,
  send,
  getMicrophoneMuteState,
  setMicrophoneMuteState,
  getMicrophoneToggleShortcut,
  setMicrophoneToggleShortcut,
};
