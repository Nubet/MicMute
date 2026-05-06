import {spawnSync} from 'node:child_process';

function hasCommand(command) {
  const result = spawnSync('bash', ['-lc', `command -v ${command}`], {stdio: 'ignore'});
  return result.status === 0;
}

if (process.platform !== 'linux') {
  process.exit(0);
}

if (!hasCommand('rpmbuild')) {
  console.error('Missing required tool: rpmbuild');
  console.error('Install it and run the build again.');
  console.error('Fedora/RHEL: sudo dnf install rpm-build');
  console.error('Debian/Ubuntu: sudo apt-get install rpm');
  process.exit(1);
}
