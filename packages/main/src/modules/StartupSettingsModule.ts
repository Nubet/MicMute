import type {AppModule} from '../AppModule.js';
import {getStartupSettingsService} from '../application/startup/getStartupSettingsService.js';
import {registerStartupSettingsIpc} from '../presentation/ipc/registerStartupSettingsIpc.js';

class StartupSettingsModule implements AppModule {
  enable(): void {
    registerStartupSettingsIpc(getStartupSettingsService());
  }
}

export function startupSettingsModule() {
  return new StartupSettingsModule();
}
