// test-svg-connections.mjs
// Playwright script to verify SVG connection paths render correctly in WorkflowCanvas

import { chromium } from 'playwright';

const SCREENSHOT_PATH = '/tmp/canvas-connections-fixed.png';
const TARGET_URL = 'http://localhost:5178/systems';

(async () => {
  console.log('=== SVG Connection Verification Script ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // Step 1: Navigate to /systems
  console.log('[1] Navigating to', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('    Page loaded successfully.\n');

  // Step 2: Click first system in sidebar
  console.log('[2] Looking for a system link in the sidebar...');

  // Try multiple selectors to find a clickable system entry
  const systemLink = await page.locator([
    'a:has-text("Client Onboarding")',
    'button:has-text("Client Onboarding")',
    '[class*="sidebar"] a:first-of-type',
    '[class*="sidebar"] button:first-of-type',
    '[class*="system"] a:first-of-type',
    'a:has-text("Onboarding")',
    'nav a:first-of-type',
    '.sidebar a:first-of-type',
    'aside a:first-of-type',
  ].join(', ')).first();

  const linkText = await systemLink.textContent().catch(() => '(no text)');
  console.log('    Found system link: "' + linkText.trim() + '"');
  await systemLink.click();
  console.log('    Clicked.\n');

  // Step 3: Wait for fitToScreen animation
  console.log('[3] Waiting 3 seconds for fitToScreen / canvas render...');
  await page.waitForTimeout(3000);
  console.log('    Done.\n');

  // Step 4: Evaluate SVG paths
  console.log('[4] Evaluating SVG path elements inside .canvas-inner svg ...\n');

  const results = await page.evaluate(() => {
    // Try multiple selectors to find the SVG canvas
    const selectors = [
      '.canvas-inner svg',
      '[class*="canvas"] svg',
      'svg',
    ];

    let svgEl = null;
    let usedSelector = '';
    for (const sel of selectors) {
      svgEl = document.querySelector(sel);
      if (svgEl) {
        usedSelector = sel;
        break;
      }
    }

    if (!svgEl) {
      return { error: 'No SVG element found on the page', selectors };
    }

    const allPaths = svgEl.querySelectorAll('path');
    if (allPaths.length === 0) {
      const allSvgPaths = document.querySelectorAll('svg path');
      return {
        error: 'No <path> elements found inside "' + usedSelector + '". Total <path> on page: ' + allSvgPaths.length,
        usedSelector,
        svgHTML: svgEl.outerHTML.substring(0, 500),
      };
    }

    const pathData = [];
    let visibleCount = 0;
    let horizontalCount = 0;
    let horizontalVisibleCount = 0;

    allPaths.forEach((path, index) => {
      const d = path.getAttribute('d') || '(no d attribute)';
      const strokeAttr = path.getAttribute('stroke') || '(none set)';
      const computed = window.getComputedStyle(path);
      const computedStroke = computed.stroke || '(none)';
      const computedStrokeWidth = computed.strokeWidth || '0';
      const computedOpacity = computed.opacity || '1';
      const computedStrokeOpacity = computed.strokeOpacity || '1';

      let bbox = { x: 0, y: 0, width: 0, height: 0 };
      try {
        const b = path.getBBox();
        bbox = { x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.width), height: Math.round(b.height) };
      } catch (e) {
        bbox = { error: e.message };
      }

      const isTransparent =
        computedStroke === 'transparent' ||
        computedStroke === 'none' ||
        computedStroke === 'rgba(0, 0, 0, 0)' ||
        strokeAttr === 'transparent' ||
        strokeAttr === 'none';

      const isVisible = !isTransparent && parseFloat(computedStrokeWidth) > 0;

      const isHorizontal = !bbox.error && bbox.height < 2 && bbox.width > 5;

      if (isVisible) visibleCount++;
      if (isHorizontal) {
        horizontalCount++;
        if (isVisible) horizontalVisibleCount++;
      }

      pathData.push({
        index,
        d: d.length > 120 ? d.substring(0, 120) + '...' : d,
        strokeAttr,
        computedStroke,
        computedStrokeWidth,
        computedOpacity,
        computedStrokeOpacity,
        bbox,
        isVisible,
        isHorizontal,
      });
    });

    return {
      usedSelector,
      totalPaths: allPaths.length,
      visibleCount,
      horizontalCount,
      horizontalVisibleCount,
      paths: pathData,
    };
  });

  // Step 5: Report findings
  console.log('--------------------------------------------------');

  if (results.error) {
    console.error('  ERROR:', results.error);
    if (results.svgHTML) console.log('  SVG snippet:', results.svgHTML);
    if (results.selectors) console.log('  Tried selectors:', results.selectors);
  } else {
    console.log('  Selector used       : ' + results.usedSelector);
    console.log('  Total <path> found  : ' + results.totalPaths);
    console.log('  Visible paths       : ' + results.visibleCount);
    console.log('  Horizontal paths    : ' + results.horizontalCount);
    console.log('  Horiz. & visible    : ' + results.horizontalVisibleCount);
    console.log('--------------------------------------------------\n');

    console.log('  Per-path details:\n');
    for (const p of results.paths) {
      const tag = [
        p.isVisible ? 'VISIBLE' : 'HIDDEN',
        p.isHorizontal ? 'HORIZONTAL' : '',
      ].filter(Boolean).join(' | ');

      console.log('  [' + p.index + '] (' + tag + ')');
      console.log('      d              : ' + p.d);
      console.log('      stroke (attr)  : ' + p.strokeAttr);
      console.log('      stroke (comp.) : ' + p.computedStroke);
      console.log('      strokeWidth    : ' + p.computedStrokeWidth);
      console.log('      opacity        : ' + p.computedOpacity + '  strokeOpacity: ' + p.computedStrokeOpacity);
      if (p.bbox.error) {
        console.log('      bbox           : ERROR - ' + p.bbox.error);
      } else {
        console.log('      bbox           : x=' + p.bbox.x + ' y=' + p.bbox.y + ' w=' + p.bbox.width + ' h=' + p.bbox.height);
      }
      console.log('');
    }

    // Final verdict
    console.log('==================================================');
    if (results.visibleCount === 0) {
      console.log('  RESULT: FAIL - No visible SVG connection paths found.');
    } else if (results.horizontalCount > 0 && results.horizontalVisibleCount === 0) {
      console.log('  RESULT: FAIL - Horizontal connection paths exist but none are visible.');
    } else if (results.horizontalCount > 0 && results.horizontalVisibleCount === results.horizontalCount) {
      console.log('  RESULT: PASS - All ' + results.horizontalCount + ' horizontal path(s) have a visible stroke.');
    } else if (results.horizontalCount === 0 && results.visibleCount > 0) {
      console.log('  RESULT: PASS (no horizontal lines detected, but ' + results.visibleCount + ' visible path(s) found).');
    } else {
      console.log('  RESULT: PARTIAL - ' + results.horizontalVisibleCount + '/' + results.horizontalCount + ' horizontal paths visible.');
    }
    console.log('==================================================\n');
  }

  // Step 6: Screenshot
  console.log('[5] Taking screenshot -> ' + SCREENSHOT_PATH);
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: false });
  console.log('    Screenshot saved.\n');

  await browser.close();
  console.log('Done. Browser closed.');
})();
