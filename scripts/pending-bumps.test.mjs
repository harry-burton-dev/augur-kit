import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bumps } from './pending-bumps.mjs';

test('an empty changeset bumps nothing; one naming a package does', () => {
  assert.equal(bumps('---\n---\n'), false);
  assert.equal(bumps('---\n---\n\nSome notes\n'), false);
  assert.equal(bumps("---\n'@augur/kit-bundle': minor\n---\n\nNew kit\n"), true);
});
