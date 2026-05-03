function getElectronApi() {
  if (!window.electronApi) {
    throw new Error('Electron API is not available.');
  }

  return window.electronApi;
}

export async function getSystemMicrophoneMuteState(): Promise<boolean> {
  return getElectronApi().getMicrophoneMuteState();
}

export async function setSystemMicrophoneMuteState(muted: boolean): Promise<boolean> {
  return getElectronApi().setMicrophoneMuteState(muted);
}
