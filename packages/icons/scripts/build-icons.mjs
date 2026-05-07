/**
 * ICONS BUILD SCRIPT
 * ══════════════════
 * This script turns raw SVG files into a production-ready icon system.
 *
 * INPUT:  src/svg/*.svg       — one SVG file per icon (Figma exports or hand-crafted)
 * OUTPUT: dist/sprite.svg     — a single <svg> with all icons as <symbol> elements
 *         dist/index.js       — the stamp-icon Web Component + icon name union type
 *         dist/index.d.ts     — TypeScript declarations
 *         dist/icons.json     — metadata (name list, viewBox per icon)
 *
 * ─── WHY SPRITES? ──────────────────────────────────────────────────────────
 * Option A — Inline SVG per component:
 *   Each component carries its own SVG markup. Simple, but:
 *   - 10 icon usages of the same icon = 10 copies of the same SVG bytes in HTML.
 *   - No browser caching — each page re-parses the same markup.
 *
 * Option B — SVG sprite (what we use):
 *   Load ONE sprite.svg file at the top of <body> (or via HTTP).
 *   Each icon usage is: <svg><use href="#stamp-icon-check"/></svg>
 *   - Single HTTP request, cached by browser across navigations.
 *   - 10 usages = 10 × 20 bytes of <use> markup, not 10 × 200 bytes of SVG.
 *   - CSS currentColor still works — stroke/fill inherit from parent.
 *
 * ─── WHY SVGO? ──────────────────────────────────────────────────────────────
 * SVG files from Figma contain:
 *   - Empty <g> groups        → removed
 *   - Redundant attributes    → collapsed
 *   - Comments, metadata      → stripped
 *   - Verbose coordinate data → shortened
 * SVGO typically reduces SVG file size by 40-70% with no visual change.
 *
 * ─── SPRITE FORMAT ──────────────────────────────────────────────────────────
 * The output sprite.svg looks like this:
 *
 *   <svg xmlns="http://www.w3.org/2000/svg" style="display:none">
 *     <symbol id="stamp-icon-check" viewBox="0 0 24 24">
 *       <polyline points="20 6 9 17 4 12"/>
 *     </symbol>
 *     <symbol id="stamp-icon-x" viewBox="0 0 24 24">
 *       ...
 *     </symbol>
 *   </svg>
 *
 * The outer <svg> is hidden (display:none). Each icon is a <symbol> with a
 * unique ID. To render an icon anywhere on the page:
 *
 *   <svg aria-hidden="true" width="24" height="24">
 *     <use href="#stamp-icon-check"/>
 *   </svg>
 *
 * The <use> element "teleports" the symbol content into the rendering tree.
 * It inherits CSS properties (color, fill, stroke) from the parent.
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, basename } from 'path';
import { optimize } from 'svgo';

const SRC_DIR = new URL('../src/svg/', import.meta.url).pathname;
const DIST_DIR = new URL('../dist/', import.meta.url).pathname;

// ─── SVGO CONFIG ─────────────────────────────────────────────────────────────
// These are the optimisation plugins we run on every SVG.
const SVGO_CONFIG = {
  plugins: [
    'removeDoctype',           // removes <!DOCTYPE svg ...>
    'removeXMLProcInst',       // removes <?xml version="1.0"?>
    'removeComments',          // removes <!-- comments -->
    'removeMetadata',          // removes <metadata> blocks
    'removeEditorsNSData',     // removes Illustrator/Inkscape namespace data
    'cleanupIds',              // minifies id attributes (e.g. "a", "b", "c")
    'removeUselessDefs',       // removes <defs> with no referenced content
    'removeUnknownsAndDefaults', // removes unknown tags and default attribute values
    'removeNonInheritableGroupAttrs', // removes non-inheritable attrs from <g>
    'removeUselessStrokeAndFill', // removes redundant stroke/fill="none"
    'removeViewBox',           // DISABLED — we KEEP viewBox for sizing flexibility
    'collapseGroups',          // merges nested <g> into parent if possible
    'convertShapeToPath',      // converts <rect>, <circle> etc. to <path> for consistency
    'convertPathData',         // shortens path data (M 10 10 → M10 10)
    'mergePaths',              // merges adjacent path elements with same attributes
  ],
};

async function main() {
  // 1. Ensure dist directory exists.
  await mkdir(DIST_DIR, { recursive: true });

  // 2. Read all .svg files in src/svg/.
  const files = (await readdir(SRC_DIR)).filter(f => f.endsWith('.svg'));
  console.log(`Found ${files.length} SVG files.`);

  const symbols = [];  // will hold each <symbol> string
  const metadata = []; // will hold { name, viewBox } per icon

  // 3. Process each SVG file.
  for (const file of files) {
    const name = basename(file, '.svg'); // "check.svg" → "check"
    const raw = await readFile(join(SRC_DIR, file), 'utf8');

    // Optimise with SVGO.
    const result = optimize(raw, { ...SVGO_CONFIG, path: file });
    const optimised = result.data;

    // Extract the viewBox attribute from the optimised SVG.
    // Regex explanation: match viewBox="..." including quotes and spaces.
    const viewBoxMatch = optimised.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

    // Extract the inner content of the <svg> tag (everything between <svg ...> and </svg>).
    // We strip the outer <svg> because we're wrapping it in <symbol>.
    const innerMatch = optimised.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    const inner = innerMatch ? innerMatch[1].trim() : '';

    // Build the <symbol> element.
    // ID format: "stamp-icon-{name}" — the prefix prevents collisions with
    // any other IDs on the page.
    symbols.push(`  <symbol id="stamp-icon-${name}" viewBox="${viewBox}">\n    ${inner}\n  </symbol>`);
    metadata.push({ name, viewBox });

    console.log(`  ✓ ${name} (${optimised.length} bytes → ${inner.length} bytes inner)`);
  }

  // 4. Assemble the sprite SVG.
  // display:none on the outer <svg> so it takes up no space on the page.
  // It only serves as a container for the <symbol> definitions.
  const sprite = [
    `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">`,
    ...symbols,
    `</svg>`,
  ].join('\n');

  await writeFile(join(DIST_DIR, 'sprite.svg'), sprite, 'utf8');
  console.log('✓ dist/sprite.svg written');

  // 5. Write metadata JSON (icon name list + viewBox per icon).
  // Used by Storybook to generate a dynamic icon picker control.
  await writeFile(join(DIST_DIR, 'icons.json'), JSON.stringify(metadata, null, 2), 'utf8');
  console.log('✓ dist/icons.json written');

  // 6. Generate the icon name union type from the actual file list.
  // This gives consumers full TypeScript autocomplete:
  //   <stamp-icon name="check">  ← IDE suggests: "check" | "x" | "info" | ...
  const names = metadata.map(m => `'${m.name}'`).join(' | ');
  const iconNamesType = `export type IconName = ${names};`;

  // 7. Write the Web Component as a JS module.
  // We write it as a string so the build script is self-contained (no tsc here).
  const componentJS = `
/**
 * stamp-icon — renders a named icon from the Stamp sprite sheet.
 *
 * Usage:
 *   <!-- Load the sprite once at the top of <body> -->
 *   <script>
 *     fetch('@stamp-ds/icons/sprite')
 *       .then(r => r.text())
 *       .then(svg => { document.body.insertAdjacentHTML('afterbegin', svg); });
 *   </script>
 *
 *   <!-- Then use anywhere -->
 *   <stamp-icon name="check" size="24" label="Done"></stamp-icon>
 *
 * The 'label' prop adds aria-label to the inner <svg> for screen readers.
 * Omit it for decorative icons (they get aria-hidden="true" automatically).
 */
import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('stamp-icon')
export class StampIcon extends LitElement {
  static styles = css\`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      /* width/height default to 1em so the icon scales with the surrounding text. */
      width: 1em;
      height: 1em;
    }
    svg {
      width: 100%;
      height: 100%;
      /* fill/stroke inherit from the parent so color: red on a parent colours the icon. */
      fill: currentColor;
      stroke: currentColor;
    }
  \`;

  /** Icon name — must match a <symbol id="stamp-icon-{name}"> in the sprite. */
  @property() name = '';

  /** Pixel size. Overrides the default 1em sizing. */
  @property({ type: Number }) size = 0;

  /**
   * Accessible label. Provide this for icons that convey meaning on their own.
   * Omit for decorative icons (those accompanied by visible text).
   */
  @property() label = '';

  render() {
    const sizeStyle = this.size ? \`width: \${this.size}px; height: \${this.size}px;\` : '';
    const isDecorative = !this.label;

    return html\`
      <svg
        style=\${sizeStyle}
        aria-hidden=\${isDecorative ? 'true' : undefined}
        aria-label=\${this.label || undefined}
        role=\${isDecorative ? undefined : 'img'}
      >
        <use href="#stamp-icon-\${this.name}"></use>
      </svg>
    \`;
  }
}
`;

  await writeFile(join(DIST_DIR, 'index.js'), componentJS.trim(), 'utf8');

  // 8. Write TypeScript declarations.
  const dts = `
import { LitElement } from 'lit';
${iconNamesType}

export declare class StampIcon extends LitElement {
  name: IconName | '';
  size: number;
  label: string;
}
declare global {
  interface HTMLElementTagNameMap { 'stamp-icon': StampIcon; }
}
`;
  await writeFile(join(DIST_DIR, 'index.d.ts'), dts.trim(), 'utf8');
  console.log('✓ dist/index.js and dist/index.d.ts written');

  console.log('\n✅ Icons build complete.');
  console.log(`   ${metadata.length} icons → sprite.svg + TypeScript union type`);
}

main().catch(e => { console.error(e); process.exit(1); });
