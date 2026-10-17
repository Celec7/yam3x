import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

const systemChromium = ['/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync)

export default defineConfig({
  testDir: './e2e',
  outputDir: '/tmp/yam3x-docs-test-results',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [
        ['dot'],
        ['html', { outputFolder: '/tmp/yam3x-playwright-report', open: 'never' }],
        ['github'],
      ]
    : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...(systemChromium
      ? { launchOptions: { executablePath: systemChromium, args: ['--disable-gpu'] } }
      : {}),
  },
  webServer: {
    command: './node_modules/.bin/vitepress dev --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
