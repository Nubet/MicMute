import {useMicrophoneDevices} from './application/audio/useMicrophoneDevices';
import {useMicrophoneShortcut} from './application/audio/useMicrophoneShortcut';
import {useSystemMicrophoneMute} from './application/audio/useSystemMicrophoneMute';
import {useNotificationSettings} from './application/notifications/useNotificationSettings';
import {useStartupSettings} from './application/startup/useStartupSettings';
import {MicrophonePanel} from './presentation/microphone/MicrophonePanel';

function App() {
  const {
    microphones,
    selectedMicrophoneId,
    activeMicrophoneName,
    devicesError,
    selectMicrophone,
  } = useMicrophoneDevices();
  const {isMuted, isMutePending, muteError, toggleMute} = useSystemMicrophoneMute();
  const {shortcut, isSavingShortcut, shortcutError, saveShortcut} = useMicrophoneShortcut();
  const {settings: startupSettings, isSaving: isSavingStartup, error: startupError, toggleOpenAtLogin} = useStartupSettings();
  const {
    settings: notificationSettings,
    isSavingSettings: isSavingNotificationSettings,
    settingsError: notificationSettingsError,
    patchSettings: patchNotificationSettings,
  } = useNotificationSettings();

  return (
    <MicrophonePanel
      microphones={microphones}
      selectedMicrophoneId={selectedMicrophoneId}
      activeMicrophoneName={activeMicrophoneName}
      isMuted={isMuted}
      isMutePending={isMutePending}
      shortcut={shortcut}
      isSavingShortcut={isSavingShortcut}
      error={muteError || devicesError}
      shortcutError={shortcutError}
      startupSettings={startupSettings}
      isSavingStartup={isSavingStartup}
      startupError={startupError}
      notificationSettings={notificationSettings}
      isSavingNotificationSettings={isSavingNotificationSettings}
      notificationSettingsError={notificationSettingsError}
      onMicrophoneChange={selectMicrophone}
      onToggleMute={toggleMute}
      onSaveShortcut={saveShortcut}
      onToggleStartupOpenAtLogin={toggleOpenAtLogin}
      onPatchNotificationSettings={patchNotificationSettings}
    />
  );
}

export default App;
