import {sha256sum} from './nodeCrypto.js';
import {versions} from './versions.js';
import {ipcRenderer} from 'electron';

function send(channel: string, message: string) {
  return ipcRenderer.invoke(channel, message);
}

function getMicrophoneMuteState() {
  return ipcRenderer.invoke('microphone:getMuteState');
}

function setMicrophoneMuteState(muted: boolean) {
  return ipcRenderer.invoke('microphone:setMuteState', muted);
}

export {sha256sum, versions, send, getMicrophoneMuteState, setMicrophoneMuteState};
