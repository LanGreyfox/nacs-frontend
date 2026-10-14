import { test, expect } from '@playwright/test'

test('redirects unauthenticated users to the login page', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('Login')
})
