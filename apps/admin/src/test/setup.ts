import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// The suite also covers Node-environment tests (the Playwright cleanup
// helpers), which have no window to stub.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      origin: 'http://localhost:3001',
      pathname: '/',
      search: '',
      assign: vi.fn(),
      replace: vi.fn(),
    },
  });
  // jsdom does not implement scrollIntoView at all.
  Element.prototype.scrollIntoView = vi.fn();

  /* ProseMirror measures the document to keep the caret on screen, and jsdom
   * implements none of the geometry APIs it calls. Without these, any test
   * that renders the Tiptap editor dies inside `coordsAtPos` with
   * "target.getClientRects is not a function" -- a jsdom gap, not a bug in the
   * editor. Zeroed rectangles are enough: nothing under test asserts layout. */
  const emptyRect = () => ({
    top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0,
    toJSON: () => ({}),
  });
  const rectList = () => Object.assign([], { item: () => null }) as unknown as DOMRectList;
  if (!Range.prototype.getClientRects)
    Range.prototype.getClientRects = rectList;
  if (!Range.prototype.getBoundingClientRect)
    Range.prototype.getBoundingClientRect = emptyRect as unknown as () => DOMRect;
  if (!Element.prototype.getClientRects)
    Element.prototype.getClientRects = rectList;
  // ProseMirror maps a click back to a document position through this.
  if (!document.elementFromPoint)
    document.elementFromPoint = () => null as unknown as Element;
}
