import {spawnSync} from 'node:child_process';

function hasCommand(command) {
  const result = spawnSync('bash', ['-lc', `command -v ${command}`], {stdio: 'ignore'});
  return result.status === 0;
}

if (process.platform === 'linux') {
  if (!hasCommand('wine')) {
    console.error('Missing required tool: wine');
    console.error('To build Windows packages from Linux, install Wine and retry.');
    console.error('Fedora: sudo dnf install wine');
    console.error('Debian/Ubuntu: sudo apt-get install wine64');
    process.exit(1);
  }
}
