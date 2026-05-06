# MicMute

Multiplatform Desktop Electron app for quickly muting and unmuting your system microphone.
App combines a control panel, global shortcut support, tray integration, and startup/notification preferences.

## What you get
- **One-Click Mute Toggle**  
  Toggle system microphone state instantly from the app UI.
- **Global Shortcut**  
  Configure a keyboard shortcut to toggle mic state from anywhere.
- **Tray Integration**  
  Keep the app in the system tray and see status at a glance.
- **Startup Settings**  
  Enable launch at login (platform support dependent).
- **Notification Settings**  
  Control mute-change notifications and toggle sound effects.

## Platform notes
- **Windows**: Full microphone control and global shortcut flow supported.
- **Linux**: Microphone control works; global shortcuts depend on desktop environment capabilities.
- **GNOME + Wayland**: Global shortcuts are currently not available due to platform limitations.

## Tech stack
- **Desktop Runtime**: Electron
- **Frontend**: React + Vite
- **Language**: TypeScript

## Project structure
- `packages/main` - Electron main process, app modules, OS integrations.
- `packages/preload` - Secure bridge API exposed to renderer.
- `packages/renderer` - React UI and application hooks.
- `packages/shared` - Shared IPC contracts and types.

## Quick start

### Requirements
- Node.js `>=23.0.0`
- npm

### 1) Install dependencies

```bash
npm install
```

### 2) Run in development mode

```bash
npm run start
```

### 3) Build all workspaces

```bash
npm run build
```

### 4) Build packaged artifacts

```bash
npm run compile
```

Build output is generated in `dist/`.

## Packaging notes
- **Windows build**:

```bash
npm run compile:win
```

- **Linux build**:
  Generates `.deb` and `.rpm` by default.

```bash
npm run compile:linux
```

## Release process
- Releases are created by GitHub Actions from tags matching `v*`.
- Stable example: `v1.0.0`.
- Beta example: `v1.0.0-beta.1`.

Latest releases: https://github.com/Nubet/MicMute/releases

## Troubleshooting
- **Global shortcut cannot be saved on Linux**
  - If you use GNOME on Wayland, this is an OS-level limitation.
  - Try GNOME on X11 or another desktop environment with global shortcuts support.

- **Build/package issues**
  - Reinstall dependencies: `rm -rf node_modules && npm install`.
  - For Windows builds from Linux, ensure Wine is installed:
    - Fedora/RHEL: `sudo dnf install wine`
    - Debian/Ubuntu: `sudo apt-get install wine64`
  - For `.rpm` builds on Linux, ensure `rpmbuild` is installed:
    - Fedora/RHEL: `sudo dnf install rpm-build`
    - Debian/Ubuntu: `sudo apt-get install rpm`
