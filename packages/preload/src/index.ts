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

function toggleMicrophoneMuteState() {
  return ipcRenderer.invoke(MICROPHONE_IPC_CHANNELS.toggleMuteState);
}

function onMicrophoneMuteStateChanged(listener: (muted: boolean) => void) {
  const wrappedListener = (_event: unknown, muted: boolean) => {
    listener(muted);
  };

  ipcRenderer.on(MICROPHONE_IPC_CHANNELS.muteStateChanged, wrappedListener);

  return () => {
    ipcRenderer.removeListener(MICROPHONE_IPC_CHANNELS.muteStateChanged, wrappedListener);
  };
}

function getMicrophoneToggleShortcut() {
  return ipcRenderer.invoke(MICROPHONE_IPC_CHANNELS.getToggleShortcut);
}

function setMicrophoneToggleShortcut(accelerator: string | null) {
  return ipcRenderer.invoke(MICROPHONE_IPC_CHANNELS.setToggleShortcut, accelerator);
}

function getStartupSettings() {
  return ipcRenderer.invoke(MICROPHONE_IPC_CHANNELS.getStartupSettings);
}

function setStartupOpenAtLogin(enabled: boolean) {
  return ipcRenderer.invoke(MICROPHONE_IPC_CHANNELS.setStartupOpenAtLogin, enabled);
}

function getNotificationSettings() {
  return ipcRenderer.invoke(MICROPHONE_IPC_CHANNELS.getNotificationSettings);
}

function updateNotificationSettings(patch: {
  showTrayNotificationOnMuteChange?: boolean;
  playSoundOnMuteToggle?: boolean;
}) {
  return ipcRenderer.invoke(MICROPHONE_IPC_CHANNELS.updateNotificationSettings, patch);
}

export {
  sha256sum,
  versions,
  send,
  getMicrophoneMuteState,
  setMicrophoneMuteState,
  toggleMicrophoneMuteState,
  onMicrophoneMuteStateChanged,
  getMicrophoneToggleShortcut,
  setMicrophoneToggleShortcut,
  getStartupSettings,
  setStartupOpenAtLogin,
  getNotificationSettings,
  updateNotificationSettings,
};
