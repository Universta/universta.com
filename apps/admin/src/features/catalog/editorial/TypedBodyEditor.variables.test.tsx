import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { COUNTRY_EDITORIAL_VARIABLES } from '@/features/shared/variable-autocomplete';
import { buildSuggestions } from '@/features/shared/entity-autocomplete';
import { TypedBodyEditor } from './TypedBodyEditor';

/**
 * Dynamic variables have been through three pickers now.
 *
 * They started as a `%` suggestion list a hand-built editor drew itself. When
 * Jodit took over the typing surface that list was replaced by a dropdown
 * beside the toolbar, because intercepting Jodit's keystrokes to draw our own
 * popup was exactly the editor behaviour we had stopped maintaining. It is back
 * inline, on `%`, because a control beside the field is not where an author is
 * looking -- but it is now one implementation inside the shared editor, and it
 * offers records as well as variables.
 *
 * What has never moved is the substance: a field offers the variables scoped to
 * its context and no others, and the token it inserts is the one the public
 * renderer resolves. That is what this file pins. The caret handling belongs to
 * the shared editor and is covered in a browser.
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
  it('no longer puts a variable chooser beside the field', async () => {
    render(<CountryContentEditor />);
    await screen.findByRole('textbox', { name: 'Paragraph 1' });

    expect(screen.queryByLabelText(/Insert variable/i)).toBeNull();
  });

  it('offers the variables scoped to a Country and no others', () => {
    const suggestions = buildSuggestions({
      query: '',
      variables: COUNTRY_EDITORIAL_VARIABLES,
      variableValues: { countryName: 'India', countrySlug: 'india' },
      context: 'country',
      entities: [],
    });

    const labels = suggestions.map((row) => row.label);
    expect(labels).toContain('Country name');
    expect(labels).toContain('Country slug');
    expect(labels.join(' ')).not.toMatch(/job/i);
  });

  it('inserts the value a Country variable names', () => {
    /* The routed Country page is CountryDetailReference, which does not run
     * resolveContentVariables -- so a `{countrySlug}` token left in the text
     * would publish literally. The current value is inserted instead, which is
     * why this assertion changed shape when the picker did. */
    const [slug] = buildSuggestions({
      query: 'slug',
      variables: COUNTRY_EDITORIAL_VARIABLES,
      variableValues: { countryName: 'India', countrySlug: 'india' },
      context: 'country',
      entities: [],
    });

    expect(slug.label).toBe('Country slug');
    expect(slug.insertText).toBe('india');
  });

  it('keeps a token dynamic in a context whose page resolves one', () => {
    const [name] = buildSuggestions({
      query: 'university name',
      variables: [{ key: 'universityName', label: 'University name' }],
      variableValues: { universityName: 'IIT Delhi' },
      context: 'university',
      entities: [],
    });

    expect(name.insertText).toBe('{universityName}');
  });
});
