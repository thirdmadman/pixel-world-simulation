/// <reference types="vitest/globals" />
import { afterEach } from 'vitest';

afterEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.resetModules();
});
