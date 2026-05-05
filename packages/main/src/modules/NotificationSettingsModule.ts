import {Notification, shell} from 'electron';
import type {AppModule} from '../AppModule.js';
import type {ModuleContext} from '../ModuleContext.js';
import {getMicrophoneMuteStateCoordinator} from '../application/audio/getMicrophoneMuteStateCoordinator.js';
import {getNotificationSettingsService} from '../application/notifications/getNotificationSettingsService.js';
import {registerNotificationSettingsIpc} from '../presentation/ipc/registerNotificationSettingsIpc.js';

class NotificationSettingsModule implements AppModule {
  async enable({app}: ModuleContext): Promise<void> {
    await app.whenReady();

    const settingsService = getNotificationSettingsService();
    registerNotificationSettingsIpc(settingsService);

    let isFirstEmission = true;
    const unsubscribe = getMicrophoneMuteStateCoordinator().subscribe((muted) => {
      if (isFirstEmission) {
        isFirstEmission = false;
        return;
      }

      const settings = settingsService.getSettings();

      if (settings.showTrayNotificationOnMuteChange) {
        new Notification({
          title: 'Microphone state changed',
          body: muted ? 'Microphone is now muted.' : 'Microphone is now active.',
        }).show();
      }

      if (settings.playSoundOnMuteToggle) {
        shell.beep();
      }
    });

    app.on('before-quit', () => {
      unsubscribe();
    });
  }
}

export function notificationSettingsModule() {
  return new NotificationSettingsModule();
}
