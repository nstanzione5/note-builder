const assert = require('node:assert/strict');
const test = require('node:test');
const { allowedPath, scopedPath, userKeyFromEmail } = require('./drive-store');

test('legacy draft paths are scoped to the authenticated user', () => {
  assert.equal(scopedPath('data/draft/current.json', 'Clinician@Example.com'), 'data/draft/users/clinician-at-example-com/current.json');
  assert.equal(userKeyFromEmail('Clinician@Example.com'), 'clinician-at-example-com');
});

test('cross-user draft paths are rejected', () => {
  assert.throws(
    () => allowedPath('data/draft/users/other-at-example-com/current.json', 'clinician@example.com', false),
    /different user/,
  );
});

test('unexpected Drive paths are rejected', () => {
  assert.throws(() => allowedPath('private/unbounded.json', 'clinician@example.com', true), /not allowed/);
  assert.throws(() => allowedPath('../escape.json', 'clinician@example.com', false), /Invalid Drive path/);
});
