import type {MicrophoneMutePort} from '../../../domain/audio/MicrophoneMutePort.js';
import {parseBooleanFromPowerShellOutput, runPowerShellScript} from './windowsPowerShell.js';

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

export class WindowsMicrophoneMutePort implements MicrophoneMutePort {
  async getMuteState(): Promise<boolean> {
    const script = `${windowsMicControlCode}\n[WindowsMicMute]::GetMute()`;
    const output = await runPowerShellScript(script);
    return parseBooleanFromPowerShellOutput(output);
  }

  async setMuteState(muted: boolean): Promise<boolean> {
    const script = `${windowsMicControlCode}\n[WindowsMicMute]::SetMute($${muted ? 'true' : 'false'})`;
    const output = await runPowerShellScript(script);
    return parseBooleanFromPowerShellOutput(output);
  }
}
