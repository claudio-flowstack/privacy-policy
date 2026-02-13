import { chromium } from 'playwright';

(async () => {
  console.log('=== WorkflowCanvas Connection Rendering Test ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // Collect console messages from the page
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[BROWSER ERROR] ${msg.text()}`);
    }
  });

  console.log('1. Navigating to http://localhost:5178/systems ...');
  try {
    await page.goto('http://localhost:5178/systems', { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    console.error('ERROR: Could not navigate to the page. Is the dev server running on port 5178?');
    console.error(e.message);
    await browser.close();
    process.exit(1);
  }
  console.log('   Page loaded successfully.\n');

  // Wait for React to render
  await page.waitForTimeout(1000);

  // Click "Client Onboarding" in the sidebar
  console.log('2. Clicking "Client Onboarding" in the sidebar...');
  const clientOnboardingBtn = await page.locator('button', { hasText: 'Client Onboarding' }).first();
  if (await clientOnboardingBtn.isVisible()) {
    await clientOnboardingBtn.click();
    console.log('   Clicked "Client Onboarding".\n');
  } else {
    // Try the card button in the dashboard grid instead
    console.log('   Sidebar button not found, trying card...');
    const cardBtn = await page.locator('button:has-text("Client Onboarding")').first();
    await cardBtn.click();
    console.log('   Clicked card for "Client Onboarding".\n');
  }

  // Wait for fitToScreen animation
  console.log('3. Waiting 3 seconds for canvas + fitToScreen to complete...');
  await page.waitForTimeout(3000);

  // Take post-click screenshot
  await page.screenshot({ path: '/tmp/canvas-test.png', fullPage: true });
  console.log('   Full page screenshot saved to /tmp/canvas-test.png\n');

  // Dump the full page HTML structure (top-level)
  console.log('4. Page structure after clicking:');
  const pageStructure = await page.evaluate(() => {
    function describeEl(el, depth = 0, maxDepth = 4) {
      if (depth > maxDepth) return null;
      const info = {
        tag: el.tagName,
        class: (el.className?.toString?.() || el.className?.baseVal || '').substring(0, 120),
        id: el.id || undefined,
        childCount: el.children.length,
      };
      if (el.children.length > 0 && el.children.length <= 15) {
        info.children = Array.from(el.children).map(c => describeEl(c, depth + 1, maxDepth)).filter(Boolean);
      }
      return info;
    }
    return describeEl(document.getElementById('root') || document.body, 0, 5);
  });
  console.log(JSON.stringify(pageStructure, null, 2));
  console.log('');

  // Now run the detailed canvas inspection
  console.log('5. Inspecting canvas internals...\n');
  
  const canvasData = await page.evaluate(() => {
    const result = {};

    // a. Find .canvas-inner or similar container
    const canvasInner = document.querySelector('.canvas-inner');
    result.canvasInnerExists = !!canvasInner;

    // Also try other canvas-related selectors
    const canvasSelectors = [
      '.canvas-inner', '.canvas-viewport', '.workflow-canvas',
      '[class*="canvas"]', '[class*="Canvas"]', '[class*="workflow"]', '[class*="Workflow"]'
    ];
    result.canvasSelectors = {};
    for (const sel of canvasSelectors) {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) {
        result.canvasSelectors[sel] = Array.from(els).map(el => ({
          tag: el.tagName,
          className: (el.className?.toString?.() || '').substring(0, 120),
          rect: el.getBoundingClientRect(),
          childCount: el.children.length,
          childTags: Array.from(el.children).map(c => c.tagName + '.' + (c.className?.toString?.() || c.className?.baseVal || '').substring(0, 60))
        }));
      }
    }

    // Find ALL SVGs on the page with details
    const allSvgs = document.querySelectorAll('svg');
    result.allSvgs = Array.from(allSvgs).map(s => {
      const rect = s.getBoundingClientRect();
      return {
        className: s.className?.baseVal || '',
        parentTag: s.parentElement?.tagName,
        parentClass: (s.parentElement?.className?.toString?.() || '').substring(0, 80),
        width: s.getAttribute('width'),
        height: s.getAttribute('height'),
        viewBox: s.getAttribute('viewBox'),
        style: s.getAttribute('style'),
        rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        gCount: s.querySelectorAll('g').length,
        pathCount: s.querySelectorAll('path').length,
        lineCount: s.querySelectorAll('line').length,
        circleCount: s.querySelectorAll('circle').length
      };
    });
    result.totalSvgs = allSvgs.length;

    // Look for the main canvas SVG (likely the one with connections)
    // It should be bigger than icon SVGs and contain path/g elements for connections
    const canvasSvg = Array.from(allSvgs).find(s => {
      const rect = s.getBoundingClientRect();
      return rect.width > 100 && rect.height > 100;
    });

    if (canvasSvg) {
      result.mainSvgFound = true;
      const gElements = canvasSvg.querySelectorAll('g');
      const pathElements = canvasSvg.querySelectorAll('path');
      result.gCount = gElements.length;
      result.pathCount = pathElements.length;

      result.svgAttributes = {
        width: canvasSvg.getAttribute('width'),
        height: canvasSvg.getAttribute('height'),
        viewBox: canvasSvg.getAttribute('viewBox'),
        className: canvasSvg.className?.baseVal || '',
        style: canvasSvg.getAttribute('style')
      };

      result.paths = Array.from(pathElements).map(path => {
        const computed = window.getComputedStyle(path);
        return {
          d: path.getAttribute('d')?.substring(0, 120),
          stroke: path.getAttribute('stroke'),
          computedStroke: computed.stroke,
          strokeWidth: path.getAttribute('stroke-width'),
          computedStrokeWidth: computed.strokeWidth,
          fill: path.getAttribute('fill'),
          opacity: computed.opacity,
          visibility: computed.visibility,
          display: computed.display
        };
      });

      const svgRect = canvasSvg.getBoundingClientRect();
      result.svgBoundingRect = { x: svgRect.x, y: svgRect.y, width: svgRect.width, height: svgRect.height };
      result.svgHasZeroDimensions = svgRect.width === 0 || svgRect.height === 0;

      const svgComputed = window.getComputedStyle(canvasSvg);
      result.svgComputedCSS = {
        zIndex: svgComputed.zIndex,
        position: svgComputed.position,
        visibility: svgComputed.visibility,
        opacity: svgComputed.opacity,
        display: svgComputed.display,
        overflow: svgComputed.overflow,
        pointerEvents: svgComputed.pointerEvents,
        width: svgComputed.width,
        height: svgComputed.height
      };
    } else {
      result.mainSvgFound = false;
    }

    // f. Viewport div dimensions
    const viewport = document.querySelector('.canvas-viewport') || 
                     document.querySelector('[class*="viewport"]');
    if (viewport) {
      const vpRect = viewport.getBoundingClientRect();
      result.viewportRect = {
        selector: viewport.className?.toString?.() || '',
        x: vpRect.x, y: vpRect.y, width: vpRect.width, height: vpRect.height
      };
    } else {
      result.viewportRect = 'NOT FOUND';
    }

    // g. Transform on .canvas-inner
    if (canvasInner) {
      const ciComputed = window.getComputedStyle(canvasInner);
      result.canvasInnerTransform = {
        styleAttribute: canvasInner.getAttribute('style') || '',
        computedTransform: ciComputed.transform,
        transformOrigin: ciComputed.transformOrigin
      };
      const ciRect = canvasInner.getBoundingClientRect();
      result.canvasInnerRect = { x: ciRect.x, y: ciRect.y, width: ciRect.width, height: ciRect.height };
    }

    // Connection and node elements
    const connectionEls = document.querySelectorAll('[class*="connection"], [class*="Connection"]');
    result.connectionElements = Array.from(connectionEls).map(el => ({
      tag: el.tagName,
      className: (el.className?.toString?.() || el.className?.baseVal || '').substring(0, 100),
      rect: el.getBoundingClientRect(),
      childCount: el.children.length
    }));

    const nodeEls = document.querySelectorAll('[class*="node"], [class*="Node"]');
    result.nodeElements = Array.from(nodeEls).slice(0, 15).map(el => ({
      tag: el.tagName,
      className: (el.className?.toString?.() || el.className?.baseVal || '').substring(0, 100),
      text: el.textContent?.trim().substring(0, 50),
      rect: el.getBoundingClientRect()
    }));

    return result;
  });

  console.log('=== CANVAS INSPECTION RESULTS ===\n');
  console.log(JSON.stringify(canvasData, null, 2));

  // Take focused screenshot
  console.log('\n6. Taking focused canvas screenshot...');
  const canvasElement = await page.$('.canvas-viewport') || 
                        await page.$('[class*="viewport"]') ||
                        await page.$('[class*="canvas-inner"]') ||
                        await page.$('[class*="Canvas"]') ||
                        await page.$('[class*="canvas"]');
  
  if (canvasElement) {
    try {
      await canvasElement.screenshot({ path: '/tmp/canvas-test-focused.png' });
      console.log('   Focused canvas screenshot saved to /tmp/canvas-test-focused.png');
    } catch (e) {
      console.log(`   Could not take focused screenshot: ${e.message}`);
    }
  } else {
    console.log('   Could not find canvas element for focused screenshot.');
    // Take right-side screenshot as fallback (canvas is usually on the right)
    await page.screenshot({
      path: '/tmp/canvas-test-focused.png',
      clip: { x: 255, y: 84, width: 1665, height: 996 }
    });
    console.log('   Took clip screenshot of main content area to /tmp/canvas-test-focused.png');
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Canvas inner exists: ${canvasData.canvasInnerExists}`);
  console.log(`Canvas-related selectors found: ${Object.keys(canvasData.canvasSelectors).join(', ') || 'NONE'}`);
  console.log(`Total SVGs on page: ${canvasData.totalSvgs}`);
  console.log(`Main canvas SVG found (>100x100): ${canvasData.mainSvgFound}`);
  
  if (canvasData.mainSvgFound) {
    console.log(`  <g> elements: ${canvasData.gCount}`);
    console.log(`  <path> elements: ${canvasData.pathCount}`);
    console.log(`  SVG zero dimensions: ${canvasData.svgHasZeroDimensions}`);
    console.log(`  SVG rect: ${canvasData.svgBoundingRect.width}x${canvasData.svgBoundingRect.height} at (${canvasData.svgBoundingRect.x}, ${canvasData.svgBoundingRect.y})`);
    console.log(`  SVG visibility: ${canvasData.svgComputedCSS?.visibility}`);
    console.log(`  SVG opacity: ${canvasData.svgComputedCSS?.opacity}`);
    console.log(`  SVG display: ${canvasData.svgComputedCSS?.display}`);
    console.log(`  SVG z-index: ${canvasData.svgComputedCSS?.zIndex}`);
    console.log(`  SVG position: ${canvasData.svgComputedCSS?.position}`);
    if (canvasData.paths) {
      const visiblePaths = canvasData.paths.filter(p => p.computedStroke !== 'none' && p.computedStroke !== 'transparent' && p.visibility !== 'hidden');
      console.log(`  Visible paths (non-transparent stroke): ${visiblePaths.length}`);
      visiblePaths.forEach((p, i) => {
        console.log(`    Path ${i}: stroke=${p.computedStroke}, strokeWidth=${p.computedStrokeWidth}, d=${p.d}...`);
      });
    }
  } else {
    console.log('  Large SVGs found:');
    canvasData.allSvgs.filter(s => s.rect.w > 50 || s.rect.h > 50).forEach((s, i) => {
      console.log(`    SVG ${i}: ${s.rect.w}x${s.rect.h} at (${s.rect.x},${s.rect.y}), class="${s.className}", parent="${s.parentClass}"`);
    });
  }
  
  if (canvasData.canvasInnerTransform) {
    console.log(`  Canvas transform: ${canvasData.canvasInnerTransform.computedTransform}`);
    console.log(`  Canvas style: ${canvasData.canvasInnerTransform.styleAttribute}`);
  }
  console.log(`Connection elements: ${canvasData.connectionElements?.length || 0}`);
  console.log(`Node elements: ${canvasData.nodeElements?.length || 0}`);
  if (canvasData.nodeElements?.length > 0) {
    canvasData.nodeElements.forEach((n, i) => {
      console.log(`  Node ${i}: "${n.text}" at (${n.rect.x},${n.rect.y}) ${n.rect.width}x${n.rect.height}`);
    });
  }

  await browser.close();
  console.log('\nDone. Browser closed.');
})();
