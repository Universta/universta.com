import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { COUNTRY_EDITORIAL_VARIABLES } from '@/features/shared/variable-autocomplete';
import { TypedBodyEditor } from './TypedBodyEditor';

/**
 * Dynamic variables used to be typed: `%` opened a suggestion list the editor
 * drew itself, with its own keyboard handling. That list belonged to a
 * hand-built editor; Jodit owns the typing surface now, and intercepting its
 * keystrokes to draw our own popup is exactly the kind of editor behaviour this
 * change set out to stop maintaining.
 *
 * The feature is unchanged in substance -- the same scoped variables, inserted
 * as the same `{token}` -- but it is now picked from a control beside the
 * toolbar rather than triggered by a character. That is a deliberate UX change
 * and the reason this test moved with it.
 */

function CountryContentEditor() {
  const [value, setValue] = useState({ paragraphs: [''] });
  return (
    <TypedBodyEditor
      type="RICH_TEXT"
      value={value}
      onChange={setValue}
      variables={COUNTRY_EDITORIAL_VARIABLES}
    />
  );
}

describe('TypedBodyEditor country variables', () => {
  it('offers the variables scoped to a Country and inserts the token it names', async () => {
    render(<CountryContentEditor />);
    const chooser = await screen.findByLabelText(/Insert variable into Paragraph 1/);

    // Scoped to the Country context, not the whole variable catalogue.
    expect(chooser).toHaveTextContent('Country name');
    expect(chooser).toHaveTextContent('Country slug');
    expect(chooser).not.toHaveTextContent(/job/i);

    await userEvent.selectOptions(chooser, 'countrySlug');

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Paragraph 1' })).toHaveTextContent(
        '{countrySlug}',
      ),
    );
  });

  it('appends a second variable rather than replacing the first', async () => {
    render(<CountryContentEditor />);
    const chooser = await screen.findByLabelText(/Insert variable into Paragraph 1/);

    await userEvent.selectOptions(chooser, 'countrySlug');
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Paragraph 1' })).toHaveTextContent(
        '{countrySlug}',
      ),
    );
    await userEvent.selectOptions(chooser, 'countryName');

    await waitFor(() => {
      const body = screen.getByRole('textbox', { name: 'Paragraph 1' });
      expect(body).toHaveTextContent('{countrySlug}');
      expect(body).toHaveTextContent('{countryName}');
    });
  });
});
