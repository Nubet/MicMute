import type {AppModule} from '../AppModule.js';
import type {ModuleContext} from '../ModuleContext.js';

class LinuxGlobalShortcutsPortalModule implements AppModule {
  enable({app}: ModuleContext): void {
    if (process.platform !== 'linux') {
      return;
    }

    app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal');
  }
}

export function linuxGlobalShortcutsPortalModule() {
  return new LinuxGlobalShortcutsPortalModule();
}
