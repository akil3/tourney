/**
 * Accessibility audit using axe-core via playwright.
 * Usage: npx tsx scripts/a11y-audit.ts
 */

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const pages = [
    { url: "http://localhost:3000", name: "Home" },
    { url: "http://localhost:3000/auth/login", name: "Login" },
  ];

  for (const { url, name } of pages) {
    await page.goto(url, { waitUntil: "networkidle" });

    // Test light mode
    const lightResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    console.log(`\n══ ${name} (Light Mode) ══`);
    console.log(`  Violations: ${lightResults.violations.length}`);
    for (const v of lightResults.violations) {
      console.log(`  ❌ [${v.impact}] ${v.id}: ${v.description}`);
      console.log(`     ${v.nodes.length} element(s) affected`);
      if (v.nodes[0]) {
        console.log(`     Example: ${v.nodes[0].html.slice(0, 120)}`);
      }
    }
    if (lightResults.violations.length === 0) console.log("  ✅ No violations!");

    // Toggle to dark mode
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.waitForTimeout(300);

    const darkResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    console.log(`\n══ ${name} (Dark Mode) ══`);
    console.log(`  Violations: ${darkResults.violations.length}`);
    for (const v of darkResults.violations) {
      console.log(`  ❌ [${v.impact}] ${v.id}: ${v.description}`);
      console.log(`     ${v.nodes.length} element(s) affected`);
      if (v.nodes[0]) {
        console.log(`     Example: ${v.nodes[0].html.slice(0, 120)}`);
      }
    }
    if (darkResults.violations.length === 0) console.log("  ✅ No violations!");

    // Reset
    await page.evaluate(() => document.documentElement.classList.remove("dark"));
  }

  await browser.close();
}

main().catch(console.error);
