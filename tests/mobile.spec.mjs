import { test, expect } from '@playwright/test';

const widths = [320, 360, 390, 440, 640, 641, 800, 801, 899, 900, 1280];

async function checkLayout(page, width, enlarged = false) {
  if (!enlarged) expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  // Text ranges catch clipping even when an ancestor hides overflow.
  const outside = await page.locator('.hero-copy h1, .service-summary > span:last-child, .steps h3, .steps p').evaluateAll(elements =>
    elements.filter(el => el.getClientRects().length).flatMap(el => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const box = el.getBoundingClientRect();
      return [...range.getClientRects()].filter(r => r.left < box.left - 1 || r.right > box.right + 1)
        .map(() => el.textContent);
    }));
  expect(outside).toEqual([]);
  if (width >= 900) return;
  await expect(page.locator('.desktop-site')).toBeHidden();
  await expect(page.locator('.project-request')).toBeHidden();
  await expect(page.locator('.mobile-site')).toBeVisible();
  const preview = await page.locator('.mobile-site').boundingBox();
  const showcase = await page.locator('.site-showcase').boundingBox();
  expect(Math.abs(preview.x + preview.width / 2 - width / 2)).toBeLessThan(1);
  expect(showcase.height - preview.height).toBeLessThanOrEqual(11);
  const axis = await page.locator('.steps').evaluate(el => {
    const css = getComputedStyle(el, '::before');
    const rows = [...el.children].map(row => {
      const number = row.querySelector('span').getBoundingClientRect();
      const title = row.querySelector('h3').getBoundingClientRect();
      return { x: number.x, y: number.y, height: number.height, titleX: title.x };
    });
    return { display: css.display, height: parseFloat(css.height), top: parseFloat(css.top),
      border: css.borderLeftWidth, y: el.getBoundingClientRect().y, rows };
  });
  expect(axis.display).toBe('block');
  expect(axis.border).toBe('1px');
  expect(new Set(axis.rows.map(r => r.x)).size).toBe(1);
  expect(new Set(axis.rows.map(r => r.titleX)).size).toBe(1);
  expect(axis.rows.every(r => r.height < 40)).toBeTruthy();
  const end = axis.y + axis.top + axis.height;
  expect(end).toBeGreaterThanOrEqual(axis.rows[3].y);
  expect(end).toBeLessThanOrEqual(axis.rows[3].y + axis.rows[3].height);
}

for (const width of widths) {
  test(`${width}px: layout, native accordions and FAQ`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
    await checkLayout(page, width);
    if (width < 900) {
      const items = page.locator('.service-item');
      await page.locator('.service-accordion').screenshot({ path: testInfo.outputPath('accordion-closed.png') });
      async function checkSpans(item, open) {
        for (const span of await item.locator('summary span').all()) {
          await expect(span).toHaveCSS('transform', 'none');
        }
        const wrapper = item.locator('.service-summary');
        const title = wrapper.locator('> span:last-child');
        expect(await title.evaluate(el => getComputedStyle(el).fontSize))
          .toBe(await wrapper.evaluate(el => getComputedStyle(el).fontSize));
        await expect.poll(async () => {
          const transform = await item.locator('.service-toggle').evaluate(el => getComputedStyle(el, '::after').transform);
          return transform.startsWith(open ? 'matrix(1, 0, 0, 1,' : 'matrix(0, 1, -1, 0,');
        }).toBeTruthy();
        expect((await item.locator('summary').boundingBox()).height).toBeGreaterThanOrEqual(44);
      }
      for (const item of await items.all()) {
        await checkSpans(item, false);
        await item.locator('summary').click();
        await expect(item).toHaveAttribute('open', '');
        await checkSpans(item, true);
        await item.locator('summary').click();
        await expect(item).not.toHaveAttribute('open', '');
        await checkSpans(item, false);
      }
      for (const item of await items.all()) await item.locator('summary').click();
      await expect(page.locator('.service-item[open]')).toHaveCount(6);
      const first = items.first().locator('summary');
      await first.focus();
      await page.keyboard.press('Space');
      await expect(items.first()).not.toHaveAttribute('open', '');
      await page.keyboard.press('Enter');
      await expect(items.first()).toHaveAttribute('open', '');
      await expect(first).toHaveCSS('outline-style', 'solid');
      await expect(first).toHaveCSS('outline-width', '3px');
      await checkLayout(page, width);
      await page.locator('.service-accordion').screenshot({ path: testInfo.outputPath('accordion-open.png') });
    }
    const faq = page.locator('.faq-list details').first();
    await faq.locator('summary').click();
    await expect(faq).toHaveAttribute('open', '');
    await expect(faq.locator('summary > span')).toHaveCSS('transform', 'matrix(0.707107, 0.707107, -0.707107, 0.707107, 0, 0)');
    await faq.locator('summary').click();
    await expect(faq).not.toHaveAttribute('open', '');
    await expect(faq.locator('summary > span')).toHaveCSS('transform', 'none');
    await page.locator('.hero').screenshot({ path: testInfo.outputPath('hero.png') });
    await page.locator('.steps').screenshot({ path: testInfo.outputPath('timeline.png') });
  });
}

for (const width of [320, 360, 641, 899]) {
  test(`${width}px: enlarged text (150%)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
    await page.addStyleTag({ content: 'html{font-size:150%}' });
    await checkLayout(page, width, true);
    // Targeted text-resize acceptance for hero and timeline, including text bounds.
    const errors = await page.locator('.hero-copy, .steps').evaluateAll(elements => elements.filter(el => el.scrollWidth > el.clientWidth));
    expect(errors).toEqual([]);
    await page.locator('.hero').screenshot({ path: testInfo.outputPath('hero-large-text.png') });
    await page.locator('.steps').screenshot({ path: testInfo.outputPath('timeline-large-text.png') });
  });
}
