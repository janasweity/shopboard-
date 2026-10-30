import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('Home retains the required semantic sections and native registration constraints', async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('havlo-entrance-seen', '1'),
  )
  await page.goto('/')
  await expect(
    page.locator('header nav[aria-label="Main navigation"]'),
  ).toBeVisible()
  await expect(page.locator('main')).toHaveCount(1)
  await expect(page.locator('main section#hero')).toBeVisible()
  await expect(page.locator('main section#products')).toBeVisible()
  await expect(page.locator('main section#registration')).toBeVisible()
  await expect(page.locator('#products article.product-card')).toHaveCount(6)
  await expect(page.locator('h1')).toHaveCount(1)

  await expect(page.locator('label[for="email"]')).toHaveCount(1)
  await expect(page.locator('label[for="password"]')).toHaveCount(1)
  await expect(page.locator('#email')).toHaveAttribute('type', 'email')
  await expect(page.locator('#email')).toHaveAttribute('required', '')
  await expect(page.locator('#password')).toHaveAttribute('type', 'password')
  await expect(page.locator('#password')).toHaveAttribute('required', '')
  await expect(page.locator('#password')).toHaveAttribute('minlength', '8')
  await expect(
    page.locator('.registration-form button[type="submit"]'),
  ).toHaveCount(1)
  expect(
    await page
      .locator('.registration-form')
      .evaluate((form) => !form.noValidate && !form.checkValidity()),
  ).toBe(true)
  await page.locator('#email').fill('invalid-address')
  await page.locator('#password').fill('12345678')
  expect(
    await page
      .locator('#email')
      .evaluate((input) => input.validity.typeMismatch),
  ).toBe(true)
  await page.locator('#email').fill('demo@example.com')
  await page.locator('#password').fill('1234567')
  expect(
    await page
      .locator('#password')
      .evaluate((input) => input.validity.tooShort),
  ).toBe(true)
  await page.locator('#password').fill('12345678')
  expect(
    await page
      .locator('.registration-form')
      .evaluate((form) => form.checkValidity()),
  ).toBe(true)
})

test('active CSS is mobile-first and has no important declarations', async () => {
  const styles = await Promise.all(
    ['main.css', 'tokens.css'].map((file) =>
      readFile(new URL(`../src/styles/${file}`, import.meta.url), 'utf8'),
    ),
  )
  for (const css of styles) {
    expect(css).not.toMatch(/!\s*important/i)
    expect(css).not.toMatch(/@media[^{}]*(?:max-width|width\s*<)/i)
  }
  expect(styles[0]).toMatch(/@media\s*\(min-width:\s*768px\)/)
  expect(styles[0]).toMatch(/@media\s*\(min-width:\s*1280px\)/)
})
