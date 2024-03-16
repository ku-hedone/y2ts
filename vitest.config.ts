import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/*.{test,spec}.?(c|m)[jt]s?(x)'],
    reporters: ['default'],
    coverage: {
      enabled: true,
      provider: 'istanbul',
      include: ["src/**"],
    },
  },
});
