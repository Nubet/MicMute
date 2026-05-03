type ExposedFunction = (...args: unknown[]) => Promise<unknown>;

function getExposedFunction(name: string): ExposedFunction {
  const key = btoa(name);
  const candidate = (window as unknown as Record<string, unknown>)[key];

  if (typeof candidate !== 'function') {
    throw new Error(`${name} is not available in preload API.`);
  }

  return candidate as ExposedFunction;
}

export async function getSystemMicrophoneMuteState(): Promise<boolean> {
  const result = await getExposedFunction('getMicrophoneMuteState')();
  return Boolean(result);
}

export async function setSystemMicrophoneMuteState(muted: boolean): Promise<boolean> {
  const result = await getExposedFunction('setMicrophoneMuteState')(muted);
  return Boolean(result);
}
