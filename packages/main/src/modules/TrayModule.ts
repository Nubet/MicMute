import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {app, BrowserWindow, Menu, Tray, nativeImage} from 'electron';
import type {AppModule} from '../AppModule.js';
import type {ModuleContext} from '../ModuleContext.js';

class TrayModule implements AppModule {
  #tray: Tray | null = null;
  #isQuitting = false;

  async enable({app}: ModuleContext): Promise<void> {
    await app.whenReady();
    this.#createTray();

    app.on('before-quit', () => {
      this.#isQuitting = true;
    });

    app.on('browser-window-created', (_, window) => {
      this.#wireWindowEvents(window);
    });

    for (const window of BrowserWindow.getAllWindows()) {
      this.#wireWindowEvents(window);
    }
  }

  #wireWindowEvents(window: BrowserWindow): void {
    if (window.isDestroyed()) {
      return;
    }

    window.on('minimize', (event) => {
      event.preventDefault();
      window.hide();
    });

    window.on('close', (event) => {
      if (this.#isQuitting) {
        return;
      }

      event.preventDefault();
      window.hide();
    });
  }

  #createTray(): void {
    if (this.#tray) {
      return;
    }

    const trayIconPath = this.#resolveTrayIconPath();
    const trayImage = trayIconPath
      ? nativeImage.createFromPath(trayIconPath)
      : nativeImage.createEmpty();

    this.#tray = new Tray(trayImage);
    this.#tray.setToolTip('Microphone Control');
    this.#tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: 'Open',
          click: () => this.#showMainWindow(),
        },
        {
          label: 'Quit',
          click: () => {
            this.#isQuitting = true;
            BrowserWindow.getAllWindows().forEach((window) => window.destroy());
          },
        },
      ]),
    );

    this.#tray.on('click', () => {
      this.#showMainWindow();
    });
  }

  #showMainWindow(): void {
    const window = BrowserWindow.getAllWindows().find((current) => !current.isDestroyed());

    if (!window) {
      return;
    }

    if (window.isMinimized()) {
      window.restore();
    }

    window.show();
    window.focus();
  }

  #resolveTrayIconPath(): string | null {
    const candidates = [
      resolve(process.cwd(), 'buildResources', 'icons', 'tray-idle.ico'),
      resolve(process.cwd(), 'buildResources', 'icon.png'),
      resolve(process.cwd(), '..', 'buildResources', 'icons', 'tray-idle.ico'),
      resolve(process.cwd(), '..', 'buildResources', 'icon.png'),
      resolve(process.cwd(), '..', '..', 'buildResources', 'icons', 'tray-idle.ico'),
      resolve(process.cwd(), '..', '..', 'buildResources', 'icon.png'),
      resolve(app.getAppPath(), 'buildResources', 'icons', 'tray-idle.ico'),
      resolve(app.getAppPath(), 'buildResources', 'icon.png'),
      resolve(app.getAppPath(), '..', 'buildResources', 'icons', 'tray-idle.ico'),
      resolve(app.getAppPath(), '..', 'buildResources', 'icon.png'),
      resolve(app.getAppPath(), '..', '..', 'buildResources', 'icons', 'tray-idle.ico'),
      resolve(app.getAppPath(), '..', '..', 'buildResources', 'icon.png'),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }
}

export function trayModule() {
  return new TrayModule();
}
