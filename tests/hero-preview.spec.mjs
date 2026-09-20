import { test, expect } from '@playwright/test';

const widths = [320, 360, 390, 440, 640, 768, 899, 900, 1024, 1280, 1600];
for (const width of widths) {
  test(`Personal service hero at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width < 900 ? 844 : 900 });
    await page.goto('/');
    await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
    const hero = page.locator('.hero');
    const showcase = hero.locator('.site-showcase');
    await expect(hero.locator('h1')).toHaveText('Ihre Website.Ich kümmere mich um den Rest.');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await expect(showcase.locator('img')).toHaveCount(2);
    await expect(showcase.locator('.showcase-label')).toHaveText('Website-Beispiele');
    await expect(hero.locator('.lead')).toHaveText('Ich erstelle Ihre Website und kümmere mich anschließend um Hosting, Pflege und Änderungen.');
    await expect(hero.locator('.hero-personal')).toHaveText('Direkt mit mir – von der ersten Idee bis zur laufenden Betreuung.');
    await expect(hero.locator('.hero-assurance')).toHaveCount(0);
    await expect(hero).not.toContainText(/Demo|\.example/i);
    // The screenshot's original 72px browser bar must sit entirely above the crop.
    const crop = await showcase.locator('.preview-crop').boundingBox();
    const screenshot = await showcase.locator('.preview-crop img').boundingBox();
    expect(Math.abs(screenshot.y + screenshot.width * 72 / 1200 - crop.y)).toBeLessThan(1);
    for (const image of await showcase.locator('img').all()) {
      await expect(image).toHaveJSProperty('complete', true);
      expect(await image.evaluate(el => el.naturalWidth > 0 && el.currentSrc.startsWith(location.origin))).toBeTruthy();
      expect(await image.getAttribute('alt')).toBeTruthy();
    }
    const primary = hero.getByRole('link', { name: 'Website anfragen' });
    const secondary = hero.getByRole('link', { name: 'So funktioniert’s' });
    expect((await primary.boundingBox()).y + (await primary.boundingBox()).height).toBeLessThan(844);
    await expect(primary).toHaveAttribute('href', '#anfrage');
    await expect(secondary).toHaveAttribute('href', '#ablauf');
    const copy = await hero.locator('.hero-copy').boundingBox();
    const artwork = await showcase.boundingBox();
    if (width < 900) expect(artwork.y).toBeGreaterThan(copy.y + copy.height);
    else expect(artwork.x).toBeGreaterThan(copy.x + copy.width);
    for (const link of [primary, secondary]) {
      await link.focus();
      await expect(link).toBeFocused();
      await expect(link).toHaveCSS('outline-style', 'solid');
      await link.click({ trial: true });
    }
    const before = await showcase.boundingBox();
    await page.reload();
    await page.locator('.site-showcase img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
    const after = await page.locator('.site-showcase').boundingBox();
    expect(after.height).toBeCloseTo(before.height, 0);
    await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
    await hero.screenshot({ path: testInfo.outputPath(`hero-${width}.png`) });
    if (width <= 800) {
      const menu = page.getByRole('button', { name: 'Menü öffnen' });
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await page.locator('#main-menu').getByRole('link', { name: 'Leistungen', exact: true }).click();
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
    }
    await secondary.click();
    await expect(page).toHaveURL(/#ablauf$/);
    await expect(page.locator('#ablauf')).toBeInViewport();
    await primary.click();
    await expect(page).toHaveURL(/#anfrage$/);
    await expect(page.locator('#anfrage')).toBeInViewport();
  });
}
