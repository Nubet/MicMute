import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  getSystemMicrophoneMuteState,
  setSystemMicrophoneMuteState,
} from './electronApi'

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Unknown error'
}

function App() {
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([])
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState('')
  const [activeMicrophoneId, setActiveMicrophoneId] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const [isMutePending, setIsMutePending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopCurrentStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const resolveDisplayName = useCallback(
    (deviceId: string) => {
      const index = microphones.findIndex((microphone) => microphone.deviceId === deviceId)

      if (index === -1) {
        return 'Unknown microphone'
      }

      const microphone = microphones[index]
      return microphone.label || `Microphone ${index + 1}`
    },
    [microphones],
  )

  const loadMicrophones = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter((device) => device.kind === 'audioinput')
      setMicrophones(audioInputs)
      setSelectedMicrophoneId((currentValue) => {
        if (audioInputs.length === 0) {
          return ''
        }

        const stillExists = audioInputs.some((device) => device.deviceId === currentValue)
        if (stillExists) {
          return currentValue
        }

        const defaultInput = audioInputs.find((device) => device.deviceId === 'default')
        return defaultInput?.deviceId || audioInputs[0].deviceId
      })
      setError(null)
    } catch {
      setError('Failed to load microphone list.')
    }
  }, [])

  const startUsingMicrophone = useCallback(
    async (deviceId?: string) => {
      try {
        stopCurrentStream()

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        })

        streamRef.current = stream

        const [audioTrack] = stream.getAudioTracks()
        const currentDeviceId = audioTrack?.getSettings().deviceId || ''

        if (currentDeviceId) {
          setActiveMicrophoneId(currentDeviceId)
          setSelectedMicrophoneId(currentDeviceId)
        }

        setError(null)
        await loadMicrophones()
      } catch {
        setError('Microphone access denied or unavailable.')
      }
    },
    [loadMicrophones, stopCurrentStream],
  )

  const toggleMute = useCallback(async () => {
    try {
      setIsMutePending(true)
      const nextMuted = await setSystemMicrophoneMuteState(!isMuted)
      setIsMuted(nextMuted)
      setError(null)
    } catch (error) {
      try {
        const muted = await getSystemMicrophoneMuteState()
        setIsMuted(muted)
      } catch {
        setIsMuted(isMuted)
      }
      setError(`Failed to change system microphone mute state: ${toErrorMessage(error)}`)
    } finally {
      setIsMutePending(false)
    }
  }, [isMuted])

  const requestAccess = useCallback(async () => {
    try {
      await startUsingMicrophone(selectedMicrophoneId || undefined)
    } catch {
      setError('Microphone access denied or unavailable.')
    }
  }, [selectedMicrophoneId, startUsingMicrophone])

  const handleMicrophoneChange = useCallback(
    async (event: ChangeEvent<HTMLSelectElement>) => {
      const nextDeviceId = event.target.value
      setSelectedMicrophoneId(nextDeviceId)
      await startUsingMicrophone(nextDeviceId)
    },
    [startUsingMicrophone],
  )

  useEffect(() => {
    void loadMicrophones()

    const handleDeviceChange = () => {
      void loadMicrophones()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
      stopCurrentStream()
    }
  }, [loadMicrophones, stopCurrentStream])

  useEffect(() => {
    if (microphones.length === 0) {
      return
    }

    if (activeMicrophoneId) {
      return
    }

    void requestAccess()
  }, [activeMicrophoneId, microphones.length, requestAccess])

  useEffect(() => {
    const loadMuteState = async () => {
      try {
        const muted = await getSystemMicrophoneMuteState()
        setIsMuted(muted)
      } catch (error) {
        setError(`Failed to read system microphone mute state: ${toErrorMessage(error)}`)
      }
    }

    void loadMuteState()
  }, [])

  return (
    <main>
      <h1>Microphones</h1>
      {error ? <p>{error}</p> : null}
      {microphones.length === 0 ? (
        <p>No microphones detected.</p>
      ) : (
        <>
          <label htmlFor="microphone-select">Selected microphone</label>
          <div>
            <select
              id="microphone-select"
              value={selectedMicrophoneId}
              onChange={(event) => void handleMicrophoneChange(event)}
            >
              {microphones.map((microphone, index) => (
                <option key={microphone.deviceId} value={microphone.deviceId}>
                  {microphone.label || `Microphone ${index + 1}`}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={() => void toggleMute()} disabled={isMutePending}>
            {isMuted ? 'Unmute microphone' : 'Mute microphone'}
          </button>
          <p>In use: {activeMicrophoneId ? resolveDisplayName(activeMicrophoneId) : 'Unavailable'}</p>
          <p>Microphone status: {isMuted ? 'Muted' : 'Unmuted'}</p>
        </>
      )}
    </main>
  )
}

export default App
