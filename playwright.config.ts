import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Charge .env.local (Playwright ne le fait pas nativement) — nécessaire aux tests
// d'API qui parlent à Supabase local (URL + clés).
try {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]!]) process.env[m[1]!] = m[2]!.trim();
  }
} catch {
  /* pas de .env.local : les specs d'API seront ignorées (voir security.spec.ts) */
}

const baseURL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
