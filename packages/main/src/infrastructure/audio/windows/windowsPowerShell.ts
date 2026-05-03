import {execFile as execFileCallback} from 'node:child_process';
import {promisify} from 'node:util';

const execFile = promisify(execFileCallback);

export async function runPowerShellScript(script: string): Promise<string> {
  const prologue = "$ProgressPreference='SilentlyContinue'; $ErrorActionPreference='Stop';";
  const encodedCommand = Buffer.from(`${prologue}\n${script}`, 'utf16le').toString('base64');
  const {stdout, stderr} = await execFile('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy',
    'Bypass',
    '-EncodedCommand',
    encodedCommand,
  ]);

  return `${stdout}\n${stderr}`.trim();
}

export function parseBooleanFromPowerShellOutput(output: string): boolean {
  const matches = output.match(/\b(true|false)\b/gi);

  if (!matches || matches.length === 0) {
    throw new Error(`Could not parse PowerShell output: ${output}`);
  }

  return matches[matches.length - 1].toLowerCase() === 'true';
}
