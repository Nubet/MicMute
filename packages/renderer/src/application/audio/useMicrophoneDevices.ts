import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

function getAudioInputDevices(devices: MediaDeviceInfo[]): MediaDeviceInfo[] {
  return devices.filter((device) => device.kind === 'audioinput');
}

function getDefaultSelection(currentValue: string, devices: MediaDeviceInfo[]): string {
  if (devices.length === 0) {
    return '';
  }

  const stillExists = devices.some((device) => device.deviceId === currentValue);

  if (stillExists) {
    return currentValue;
  }

  const defaultInput = devices.find((device) => device.deviceId === 'default');
  return defaultInput?.deviceId || devices[0].deviceId;
}

export function useMicrophoneDevices() {
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState('');
  const [activeMicrophoneId, setActiveMicrophoneId] = useState('');
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCurrentStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const loadMicrophones = useCallback(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = getAudioInputDevices(devices);

    setMicrophones(audioInputs);
    setSelectedMicrophoneId((currentValue) => getDefaultSelection(currentValue, audioInputs));
  }, []);

  const startUsingMicrophone = useCallback(
    async (deviceId?: string) => {
      stopCurrentStream();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? {deviceId: {exact: deviceId}} : true,
      });

      streamRef.current = stream;

      const [audioTrack] = stream.getAudioTracks();
      const currentDeviceId = audioTrack?.getSettings().deviceId || '';

      if (currentDeviceId) {
        setActiveMicrophoneId(currentDeviceId);
        setSelectedMicrophoneId(currentDeviceId);
      }

      await loadMicrophones();
    },
    [loadMicrophones, stopCurrentStream],
  );

  const selectMicrophone = useCallback(
    async (deviceId: string) => {
      setSelectedMicrophoneId(deviceId);
      await startUsingMicrophone(deviceId);
    },
    [startUsingMicrophone],
  );

  const resolveDisplayName = useCallback(
    (deviceId: string) => {
      const index = microphones.findIndex((microphone) => microphone.deviceId === deviceId);

      if (index === -1) {
        return 'Unknown microphone';
      }

      const microphone = microphones[index];
      return microphone.label || `Microphone ${index + 1}`;
    },
    [microphones],
  );

  useEffect(() => {
    const initDevices = async () => {
      try {
        await loadMicrophones();
        setDevicesError(null);
      } catch {
        setDevicesError('Failed to load microphone list.');
      }
    };

    void initDevices();

    const handleDeviceChange = () => {
      void loadMicrophones();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      stopCurrentStream();
    };
  }, [loadMicrophones, stopCurrentStream]);

  useEffect(() => {
    const ensureActiveMicrophone = async () => {
      if (microphones.length === 0 || activeMicrophoneId) {
        return;
      }

      try {
        await startUsingMicrophone(selectedMicrophoneId || undefined);
        setDevicesError(null);
      } catch {
        setDevicesError('Microphone access denied or unavailable.');
      }
    };

    void ensureActiveMicrophone();
  }, [activeMicrophoneId, microphones.length, selectedMicrophoneId, startUsingMicrophone]);

  const activeMicrophoneName = useMemo(() => {
    if (!activeMicrophoneId) {
      return 'Unavailable';
    }

    return resolveDisplayName(activeMicrophoneId);
  }, [activeMicrophoneId, resolveDisplayName]);

  return {
    microphones,
    selectedMicrophoneId,
    activeMicrophoneName,
    devicesError,
    selectMicrophone,
  };
}
