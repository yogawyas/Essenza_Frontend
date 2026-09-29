import catalog from '../src/assets/catalog/compounds.json';

test('frozen dataset catalog has unique, selectable structures', () => {
  expect(catalog.version).toBe(1);
  expect(catalog.count).toBe(6686);
  expect(catalog.compounds).toHaveLength(catalog.count);
  expect(new Set(catalog.compounds.map(item => item.smiles)).size).toBe(catalog.count);
  for (const name of ['Vanillin', 'Linalool', 'Geraniol']) {
    const matches = catalog.compounds.filter(item => item.name === name);
    expect(matches).toHaveLength(1);
    expect(matches[0].smiles).toBeTruthy();
  }
});
