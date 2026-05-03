import {ipcMain} from 'electron';
import {execFile as execFileCallback} from 'node:child_process';
import {promisify} from 'node:util';
import type {AppModule} from '../AppModule.js';

const execFile = promisify(execFileCallback);

const windowsMicControlCode = String.raw`
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

[ComImport]
[Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
public class MMDeviceEnumeratorComObject {}

[Guid("A95664D2-9614-4F35-A746-DE8DB63617E6")]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IMMDeviceEnumerator {
  int EnumAudioEndpoints(int dataFlow, int stateMask, out object devices);
  int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice endpoint);
  int GetDevice(string id, out IMMDevice device);
  int RegisterEndpointNotificationCallback(IntPtr client);
  int UnregisterEndpointNotificationCallback(IntPtr client);
}

[Guid("D666063F-1587-4E43-81F1-B948E807363F")]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IMMDevice {
  int Activate(ref Guid iid, int clsCtx, IntPtr activationParams, [MarshalAs(UnmanagedType.IUnknown)] out object interfacePointer);
  int OpenPropertyStore(int accessMode, out IntPtr properties);
  int GetId([MarshalAs(UnmanagedType.LPWStr)] out string id);
  int GetState(out int state);
}

[Guid("5CDF2C82-841E-4546-9722-0CF74078229A")]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IAudioEndpointVolume {
  int RegisterControlChangeNotify(IntPtr notify);
  int UnregisterControlChangeNotify(IntPtr notify);
  int GetChannelCount(out uint channelCount);
  int SetMasterVolumeLevel(float levelDB, Guid eventContext);
  int SetMasterVolumeLevelScalar(float level, Guid eventContext);
  int GetMasterVolumeLevel(out float levelDB);
  int GetMasterVolumeLevelScalar(out float level);
  int SetChannelVolumeLevel(uint channelNumber, float levelDB, Guid eventContext);
  int SetChannelVolumeLevelScalar(uint channelNumber, float level, Guid eventContext);
  int GetChannelVolumeLevel(uint channelNumber, out float levelDB);
  int GetChannelVolumeLevelScalar(uint channelNumber, out float level);
  int SetMute([MarshalAs(UnmanagedType.Bool)] bool isMuted, Guid eventContext);
  int GetMute(out bool isMuted);
  int GetVolumeStepInfo(out uint step, out uint stepCount);
  int VolumeStepUp(Guid eventContext);
  int VolumeStepDown(Guid eventContext);
  int QueryHardwareSupport(out uint hardwareSupportMask);
  int GetVolumeRange(out float volumeMinDb, out float volumeMaxDb, out float volumeIncrementDb);
}

public static class WindowsMicMute {
  private const int EDataFlowCapture = 1;
  private const int ERoleConsole = 0;
  private const int ERoleMultimedia = 1;
  private const int ClsCtxAll = 23;

  private static IAudioEndpointVolume GetEndpointVolume() {
    var enumerator = (IMMDeviceEnumerator)new MMDeviceEnumeratorComObject();
    IMMDevice endpoint;

    var hr = enumerator.GetDefaultAudioEndpoint(EDataFlowCapture, ERoleConsole, out endpoint);
    if (hr != 0) {
      Marshal.ThrowExceptionForHR(hr);
    }

    var iid = typeof(IAudioEndpointVolume).GUID;
    object volumeObject;
    hr = endpoint.Activate(ref iid, ClsCtxAll, IntPtr.Zero, out volumeObject);
    if (hr != 0) {
      Marshal.ThrowExceptionForHR(hr);
    }

    return (IAudioEndpointVolume)volumeObject;
  }

  public static bool GetMute() {
    bool isMuted;
    var hr = GetEndpointVolume().GetMute(out isMuted);
    if (hr != 0) {
      Marshal.ThrowExceptionForHR(hr);
    }

    return isMuted;
  }

  public static bool SetMute(bool muted) {
    var volume = GetEndpointVolume();
    var hr = volume.SetMute(muted, Guid.Empty);
    if (hr != 0) {
      Marshal.ThrowExceptionForHR(hr);
    }

    bool isMuted;
    hr = volume.GetMute(out isMuted);
    if (hr != 0) {
      Marshal.ThrowExceptionForHR(hr);
    }

    return isMuted;
  }
}
"@ -Language CSharp
`;

async function runPowerShellScript(script: string): Promise<string> {
  const prologue = "$ProgressPreference='SilentlyContinue'; $ErrorActionPreference='Stop';";
  const encodedCommand = Buffer.from(`${prologue}\n${script}`, 'utf16le').toString('base64');
  const {stdout, stderr} = await execFile('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy',
    'Bypass',
    '-EncodedCommand',
    encodedCommand,
  ]);

  return `${stdout}\n${stderr}`.trim();
}

function parseBooleanFromPowerShellOutput(output: string): boolean {
  const matches = output.match(/\b(true|false)\b/gi);

  if (!matches || matches.length === 0) {
    throw new Error(`Could not parse PowerShell output: ${output}`);
  }

  return matches[matches.length - 1].toLowerCase() === 'true';
}

async function getWindowsMuteState(): Promise<boolean> {
  const script = `${windowsMicControlCode}\n[WindowsMicMute]::GetMute()`;
  const output = await runPowerShellScript(script);
  return parseBooleanFromPowerShellOutput(output);
}

async function setWindowsMuteState(muted: boolean): Promise<boolean> {
  const script = `${windowsMicControlCode}\n[WindowsMicMute]::SetMute($${muted ? 'true' : 'false'})`;
  const output = await runPowerShellScript(script);
  return parseBooleanFromPowerShellOutput(output);
}

class MicrophoneMuteControl implements AppModule {
  enable(): void {
    ipcMain.handle('microphone:getMuteState', async () => {
      return this.getMuteState();
    });

    ipcMain.handle('microphone:setMuteState', async (_, muted: boolean) => {
      return this.setMuteState(muted);
    });
  }

  async getMuteState(): Promise<boolean> {
    if (process.platform === 'win32') {
      return getWindowsMuteState();
    }

    if (process.platform === 'linux') {
      const {stdout} = await execFile('pactl', ['get-source-mute', '@DEFAULT_SOURCE@']);
      return stdout.toLowerCase().includes('yes');
    }

    throw new Error('System microphone mute is not supported on this platform yet.');
  }

  async setMuteState(muted: boolean): Promise<boolean> {
    if (process.platform === 'win32') {
      return setWindowsMuteState(muted);
    }

    if (process.platform === 'linux') {
      await execFile('pactl', ['set-source-mute', '@DEFAULT_SOURCE@', muted ? '1' : '0']);
      return this.getMuteState();
    }

    throw new Error('System microphone mute is not supported on this platform yet.');
  }
}

export function microphoneMuteControl() {
  return new MicrophoneMuteControl();
}
