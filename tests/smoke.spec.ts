import { test, expect } from '@playwright/test';

test('landing page has title and CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/CloudePay/);
  const cta = page.getByRole('link', { name: /Acessar Plataforma/i }).first();
  await expect(cta).toBeVisible();
});

test('login page loads', async ({ page }) => {
  await page.goto('/entrar');
  await expect(page.getByRole('heading', { name: /Bem-vindo de volta/i })).toBeVisible();
});
