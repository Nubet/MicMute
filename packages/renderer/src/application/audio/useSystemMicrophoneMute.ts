import {useCallback, useEffect, useState} from 'react';
import {
  getSystemMicrophoneMuteState,
  setSystemMicrophoneMuteState,
} from '../../infrastructure/electron/systemMicrophoneApi';

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}

export function useSystemMicrophoneMute() {
  const [isMuted, setIsMuted] = useState(false);
  const [isMutePending, setIsMutePending] = useState(false);
  const [muteError, setMuteError] = useState<string | null>(null);

  const refreshMuteState = useCallback(async () => {
    const muted = await getSystemMicrophoneMuteState();
    setIsMuted(muted);
    return muted;
  }, []);

  const toggleMute = useCallback(async () => {
    setIsMutePending(true);

    try {
      const nextMuted = await setSystemMicrophoneMuteState(!isMuted);
      setIsMuted(nextMuted);
      setMuteError(null);
    } catch (error) {
      try {
        await refreshMuteState();
      } catch {
      }

      setMuteError(`Failed to change system microphone mute state: ${toErrorMessage(error)}`);
    } finally {
      setIsMutePending(false);
    }
  }, [isMuted, refreshMuteState]);

  useEffect(() => {
    const loadMuteState = async () => {
      try {
        await refreshMuteState();
        setMuteError(null);
      } catch (error) {
        setMuteError(`Failed to read system microphone mute state: ${toErrorMessage(error)}`);
      }
    };

    void loadMuteState();
  }, [refreshMuteState]);

  return {
    isMuted,
    isMutePending,
    muteError,
    toggleMute,
  };
}
