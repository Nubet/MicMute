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

export async function toggleSystemMicrophoneMuteState(): Promise<boolean> {
  return getElectronApi().toggleMicrophoneMuteState();
}

export function onSystemMicrophoneMuteStateChanged(listener: (muted: boolean) => void): () => void {
  return getElectronApi().onMicrophoneMuteStateChanged(listener);
}

export async function getMicrophoneToggleShortcut(): Promise<string | null> {
  return getElectronApi().getMicrophoneToggleShortcut();
}

export async function setMicrophoneToggleShortcut(accelerator: string | null): Promise<string | null> {
  return getElectronApi().setMicrophoneToggleShortcut(accelerator);
}

export async function getStartupSettings(): Promise<{supported: boolean, openAtLogin: boolean}> {
  return getElectronApi().getStartupSettings();
}

export async function setStartupOpenAtLogin(enabled: boolean): Promise<{supported: boolean, openAtLogin: boolean}> {
  return getElectronApi().setStartupOpenAtLogin(enabled);
}
