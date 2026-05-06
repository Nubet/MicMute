import type {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';
import {BrowserWindow} from 'electron';
import type {AppInitConfig} from '../AppInitConfig.js';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';

class WindowManager implements AppModule {
  static readonly #WINDOW_WIDTH = 420;
  static readonly #WINDOW_HEIGHT = 460;

  readonly #preload: {path: string};
  readonly #renderer: {path: string} | URL;
  readonly #openDevTools;

  constructor({initConfig, openDevTools = false}: {initConfig: AppInitConfig, openDevTools?: boolean}) {
    this.#preload = initConfig.preload;
    this.#renderer = initConfig.renderer;
    this.#openDevTools = openDevTools;
  }

  async enable({app}: ModuleContext): Promise<void> {
    await app.whenReady();
    await this.restoreOrCreateWindow(true);
    app.on('second-instance', () => this.restoreOrCreateWindow(true));
    app.on('activate', () => this.restoreOrCreateWindow(true));
  }

  async createWindow(): Promise<BrowserWindow> {
    const windowIconPath = this.#resolveWindowIconPath();

    const browserWindow = new BrowserWindow({
      title: 'MicMute',
      width: WindowManager.#WINDOW_WIDTH,
      height: WindowManager.#WINDOW_HEIGHT,
      minWidth: WindowManager.#WINDOW_WIDTH,
      maxWidth: WindowManager.#WINDOW_WIDTH,
      minHeight: WindowManager.#WINDOW_HEIGHT,
      maxHeight: WindowManager.#WINDOW_HEIGHT,
      useContentSize: true,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
      autoHideMenuBar: true,
      ...(windowIconPath ? {icon: windowIconPath} : {}),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
        webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
        preload: this.#preload.path,
      },
    });

    if (this.#renderer instanceof URL) {
      await browserWindow.loadURL(this.#renderer.href);
    } else {
      await browserWindow.loadFile(this.#renderer.path);
    }

    const enforceFixedWindowBounds = () => {
      if (browserWindow.isDestroyed()) {
        return;
      }

      if (browserWindow.isMaximized()) {
        browserWindow.unmaximize();
      }

      browserWindow.setMinimumSize(WindowManager.#WINDOW_WIDTH, WindowManager.#WINDOW_HEIGHT);
      browserWindow.setMaximumSize(WindowManager.#WINDOW_WIDTH, WindowManager.#WINDOW_HEIGHT);
      browserWindow.setContentSize(WindowManager.#WINDOW_WIDTH, WindowManager.#WINDOW_HEIGHT);
    };

    browserWindow.on('show', enforceFixedWindowBounds);
    browserWindow.on('restore', enforceFixedWindowBounds);
    enforceFixedWindowBounds();

    browserWindow.setMenuBarVisibility(false);

    return browserWindow;
  }

  async restoreOrCreateWindow(show = false) {
    let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

    if (window === undefined) {
      window = await this.createWindow();
    }

    if (!show) {
      return window;
    }

    if (window.isMinimized()) {
      window.restore();
    }

    window?.show();

    if (this.#openDevTools) {
      window?.webContents.openDevTools();
    }

    window.focus();

    return window;
  }

  #resolveWindowIconPath(): string | null {
    const trayIconName = process.platform === 'win32' ? 'tray-idle.ico' : 'tray-idle.png';
    const candidates = [
      resolve(process.resourcesPath, 'icons', trayIconName),
      resolve(process.cwd(), 'buildResources', 'icons', trayIconName),
      resolve(process.cwd(), 'buildResources', 'icon.png'),
      resolve(process.cwd(), '..', 'buildResources', 'icons', trayIconName),
      resolve(process.cwd(), '..', 'buildResources', 'icon.png'),
      resolve(process.cwd(), '..', '..', 'buildResources', 'icons', trayIconName),
      resolve(process.cwd(), '..', '..', 'buildResources', 'icon.png'),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

}

export function createWindowManagerModule(...args: ConstructorParameters<typeof WindowManager>) {
  return new WindowManager(...args);
}
