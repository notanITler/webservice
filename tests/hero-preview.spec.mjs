import { test, expect } from '@playwright/test';

const widths = [320, 360, 390, 440, 640, 899, 900, 1024, 1280, 1440];

for (const width of widths) {
  test(`hero preview at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto('/');
    await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
    const showcase = page.locator('.site-showcase');
    await expect(showcase).toHaveRole('img');
    await expect(showcase).toHaveAccessibleName(/Beispielwebsite.*fiktiven Betrieb Hansen Haustechnik/);
    await expect(showcase.locator('a, button, input, select, textarea, [tabindex]')).toHaveCount(0);
    const phone = page.locator('.mobile-site');
    const box = await phone.boundingBox();
    const ratio = box.height / box.width;
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    if (width < 900) {
      await expect(page.locator('.desktop-site')).toBeHidden();
      await expect(page.locator('.project-request')).toBeHidden();
      await expect(showcase.locator('.preview-frame:visible')).toHaveCount(1);
      await expect(phone.locator('.site-windowbar')).toBeVisible();
      await expect(phone.locator('.site-windowbar')).toContainText('hansen-haustechnik.example');
      expect(ratio).toBeGreaterThanOrEqual(1.1);
      expect(ratio).toBeLessThanOrEqual(1.3);
      expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThan(1);
    } else {
      await expect(showcase.locator('.preview-frame:visible')).toHaveCount(2);
      expect(box.width).toBeGreaterThanOrEqual(176);
      expect(ratio).toBeGreaterThanOrEqual(2);
      expect(ratio).toBeLessThanOrEqual(2.2);
      await expect(phone.locator('.site-windowbar')).toBeHidden();
      const desktop = await page.locator('.desktop-site').boundingBox();
      expect(box.x).toBeLessThan(desktop.x + desktop.width);
      expect(box.y).toBeLessThan(desktop.y + desktop.height);
      const lines = await phone.locator('h3').evaluate(el => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
      expect(lines).toBeLessThanOrEqual(3.1);
    }

    for (const frame of await showcase.locator('.preview-frame:visible').all()) {
      const frameBox = await frame.boundingBox();
      expect(frameBox.x).toBeGreaterThanOrEqual(0);
      expect(frameBox.x + frameBox.width).toBeLessThanOrEqual(width);
      const img = frame.locator('img');
      await expect(img).toHaveCSS('object-fit', 'cover');
      expect(await img.evaluate(el => el.complete && el.naturalWidth === 1200 && el.naturalHeight === 1800)).toBeTruthy();
      expect(await frame.evaluate(el => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(1);
    }

    // Measure every visible demo text fragment, including clipping by its frame
    // and occlusion by the overlaid phone/request card. Scroll only the showcase
    // into view so hit tests work for the lower part of the hero on mobile.
    await showcase.scrollIntoViewIfNeeded();
    const textProblems = await showcase.evaluate(root => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const problems = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim() || !node.parentElement.checkVisibility()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const frame = node.parentElement.closest('.preview-frame, .project-request');
        const bounds = frame.getBoundingClientRect();
        for (const rect of range.getClientRects()) {
          if (!rect.width || !rect.height) continue;
          if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1 || rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1) {
            problems.push(`clipped: ${node.textContent}`);
          }
          const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
          if (y < 0 || y >= innerHeight) continue;
          const top = document.elementFromPoint(x, y);
          if (!node.parentElement.contains(top)) problems.push(`covered: ${node.textContent}`);
        }
      }
      return problems;
    });
    expect(textProblems).toEqual([]);

    // Real CTAs remain separate links, receive focus, and are clickable.
    for (const link of await page.locator('.hero-copy .button-row a').all()) {
      await expect(link).toBeVisible();
      await link.focus();
      await expect(link).toBeFocused();
      await link.click({ trial: true });
      expect(await link.evaluate(el => !!el.closest('.site-showcase'))).toBeFalsy();
    }
    await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    await page.locator('.hero').screenshot({ path: testInfo.outputPath(`hero-${width}.png`) });
    await testInfo.attach('preview-metrics', { body: JSON.stringify({ viewport: width, width: box.width, height: box.height, ratio }), contentType: 'application/json' });
  });
}
