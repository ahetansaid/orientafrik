import { test, expect } from '@playwright/test';

// Parcours publics : landing, navigation, gating de rôle, lecture anon (RLS),
// et 404 de partage. Aucun compte requis.
test.describe('Public & gating', () => {
  test('la landing affiche le hero et le CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /sans hasard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Créer mon plan gratuit/i }).first()).toBeVisible();
    await expect(page.getByText(/En 3 étapes/i)).toBeVisible();
    await expect(page.getByText(/Questions fréquentes/i)).toBeVisible();
  });

  test('le CTA mène à la connexion', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Créer mon plan gratuit/i }).first().click();
    await expect(page).toHaveURL(/\/connexion/);
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  });

  test('une route bachelier redirige vers la connexion sans session', async ({ page }) => {
    await page.goto('/profil');
    await expect(page).toHaveURL(/\/connexion/);
  });

  test('une route admin redirige vers la connexion sans session', async ({ page }) => {
    await page.goto('/admin/tableau-de-bord');
    await expect(page).toHaveURL(/\/connexion/);
  });

  test('la fiche école publique lit la base (RLS anon)', async ({ page }) => {
    await page.goto('/ecoles/esgis');
    await expect(page.getByRole('heading', { name: /ESGIS/i })).toBeVisible();
  });

  test('un lien de partage invalide affiche la page introuvable', async ({ page }) => {
    await page.goto('/p/slug-inexistant-xyz');
    await expect(page.getByText(/n’existe pas|n'existe pas|introuvable/i)).toBeVisible();
  });
});
