import { test, expect } from '@playwright/test';

test('teacher can create card for new student and name auto-generates', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '老师' }).click();
  await page.getByPlaceholder('请输入老师姓名').fill('琪老师');
  await page.getByPlaceholder('请输入密码').fill('yoga123');
  await page.getByRole('button', { name: '登录' }).click();

  await page.getByRole('button', { name: '会员卡' }).click();
  await page.getByRole('button', { name: '开卡' }).first().click();

  await expect(page.getByRole('button', { name: '开卡' }).first()).toBeVisible();
  await page.getByRole('checkbox').first().check();
  await page.getByPlaceholder('请输入学员姓名').fill('测试学员');
  await page.getByPlaceholder('请输入手机号').fill('13900000001');

  const cardName = page.locator('input[value*="卡"]').first();
  await expect(cardName).toBeVisible();

  await page.getByRole('button', { name: '开卡' }).nth(1).click();
  await expect(page.getByText('测试学员')).toBeVisible();
});

test('student sees level label on course card and can book', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '学员' }).click();
  await page.getByPlaceholder('请输入手机号').fill('13800000001');
  await page.getByPlaceholder('请输入密码').fill('123456');
  await page.getByRole('button', { name: '登录' }).click();

  await expect(page.locator('text=级别：').first()).toBeVisible();

  const bookButtons = page.getByRole('button', { name: '预约' });
  if (await bookButtons.count()) {
    await bookButtons.first().click();
    await expect(page.getByText('课程表')).toBeVisible();
  }
});
