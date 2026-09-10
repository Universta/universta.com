import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UnifiedEditorActions } from './UnifiedEditorActions';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('UnifiedEditorActions', () => {
  it('can render in normal document flow for the Country editor without changing its actions', () => {
    const { container } = render(<UnifiedEditorActions cancelHref="/countries" sticky={false} />);

    expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/countries');
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeEnabled();
    expect(container.firstChild).not.toHaveClass('sticky');
    expect(container.firstChild).not.toHaveClass('bottom-4');
  });
});
