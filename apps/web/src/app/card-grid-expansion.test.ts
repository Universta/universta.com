import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Expanding one card must not resize the cards beside it.
 *
 * This is a CSS rule, not component state, so it is asserted against the
 * stylesheet. A grid row is as tall as its tallest item, so a grid that holds
 * expandable cards and leaves `align-items` at its default stretches every
 * sibling to match whatever one card grew to -- which is how reading more about
 * one destination used to pull the two cards beside it to the same height, and
 * how opening one document left three empty boxes a thousand pixels tall.
 *
 * Both grids that hold a Disclosure are pinned here. `.cities` is deliberately
 * not: a city card has no expandable copy, so stretching it is safe and makes
 * each row line up.
 */
const css = readFileSync(join(process.cwd(), 'src/app/client-reference.css'), 'utf8');

/** The declarations inside one rule, by its exact selector. */
function block(selector: string): string {
  const at = css.indexOf(`${selector} {`);
  expect(at, `expected a rule for \`${selector}\``).toBeGreaterThan(-1);
  return css.slice(at, css.indexOf('}', at));
}

describe('grids that hold expandable cards', () => {
  it.each([
    ['.cref-dest .cards', 'the destination listing'],
    ['.cref-dest .cdx-grid', 'the detail page card grid'],
  ])('%s does not stretch its rows (%s)', (selector) => {
    expect(block(selector)).toMatch(/align-items:\s*start/);
  });

  it('gives the listing card its own collapsed floor rather than the row’s', () => {
    // Equal collapsed height has to come from the card, because the row is no
    // longer allowed to impose one.
    expect(block('.cref-dest .ccard')).toMatch(/min-height:/);
    expect(block('.cref-dest .cdx-card')).toMatch(/min-height:/);
  });
});

describe('the city grid', () => {
  it('may stretch, because nothing in a city card expands', () => {
    expect(block('.cref-dest .cities')).toMatch(/align-items:\s*stretch/);
  });

  it('clamps a long description so one city cannot tower over its neighbour', () => {
    expect(block('.cref-dest .city-sum')).toMatch(/line-clamp:\s*4/);
  });

  it('reserves no fixed height for a feature tile', () => {
    // A tile holds a label and nothing else. A min-height here would recreate
    // the empty boxes the tiles exist to replace.
    expect(block('.cref-dest .cdx-tile')).not.toMatch(/min-height:/);
  });
});

describe('the country card stat strip', () => {
  it.each([
    ['.cref-dest .ccard .facts .f-k', 'the label area'],
    ['.cref-dest .ccard .facts .f-v', 'the value area'],
  ])('%s reserves two lines so the strip measures the same on every card (%s)', (selector) => {
    expect(block(selector)).toMatch(/min-height:\s*calc\(2 \* 1\.3em\)/);
  });
});
