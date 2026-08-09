const assert = require('node:assert/strict');
const test = require('node:test');
const { createAuthMiddleware, parseAllowedUsers } = require('./auth');

function invoke(payload, allowed = 'approved@example.com') {
  const verifier = {
    verifyIdToken: async () => ({ getPayload: () => payload }),
  };
  const middleware = createAuthMiddleware({
    clientId: 'test-client',
    allowedUsers: parseAllowedUsers(allowed),
    verifier,
  });
  const req = { get: () => 'Bearer signed-token' };
  const response = { statusCode: 200 };
  response.status = (code) => { response.statusCode = code; return response; };
  response.json = (body) => { response.body = body; return response; };
  return new Promise((resolve) => {
    middleware(req, response, () => resolve({ req, response, nextCalled: true }))
      .then(() => resolve({ req, response, nextCalled: false }));
  });
}

test('verified allowlisted identity is attached to the request', async () => {
  const result = await invoke({ email: 'Approved@Example.com', email_verified: true, sub: 'subject-1' });
  assert.equal(result.nextCalled, true);
  assert.equal(result.req.astraUser.email, 'approved@example.com');
});

test('verified but unapproved identity is denied', async () => {
  const result = await invoke({ email: 'other@example.com', email_verified: true, sub: 'subject-2' });
  assert.equal(result.nextCalled, false);
  assert.equal(result.response.statusCode, 403);
  assert.equal(result.response.body.code, 'identity_not_allowlisted');
});

test('unverified email is denied', async () => {
  const result = await invoke({ email: 'approved@example.com', email_verified: false, sub: 'subject-3' });
  assert.equal(result.response.statusCode, 401);
  assert.equal(result.response.body.code, 'identity_unverified');
});
