const { OAuth2Client } = require('google-auth-library');

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function parseAllowedUsers(value) {
  return new Set(String(value || '')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean));
}

function createAuthMiddleware(options = {}) {
  const clientId = String(options.clientId || process.env.GOOGLE_OAUTH_CLIENT_ID || '').trim();
  const allowedUsers = options.allowedUsers instanceof Set
    ? options.allowedUsers
    : parseAllowedUsers(options.allowedUsers || process.env.ASTRA_ALLOWED_USERS);
  const verifier = options.verifier || new OAuth2Client(clientId);

  if (!clientId) throw new Error('GOOGLE_OAUTH_CLIENT_ID is required.');
  if (!allowedUsers.size) throw new Error('ASTRA_ALLOWED_USERS must contain at least one user.');

  return async function requireAstraUser(req, res, next) {
    const header = String(req.get('authorization') || '');
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ ok: false, code: 'auth_required', error: 'Google sign-in is required.' });

    try {
      const ticket = await verifier.verifyIdToken({ idToken: match[1], audience: clientId });
      const payload = ticket.getPayload() || {};
      const email = normalizeEmail(payload.email);
      if (!payload.email_verified || !email) {
        return res.status(401).json({ ok: false, code: 'identity_unverified', error: 'Verified Google identity is required.' });
      }
      if (!allowedUsers.has(email)) {
        return res.status(403).json({ ok: false, code: 'identity_not_allowlisted', error: 'This account is not authorized for Astra Notes.' });
      }
      req.astraUser = { email, subject: String(payload.sub || '') };
      return next();
    } catch (error) {
      return res.status(401).json({ ok: false, code: 'token_invalid', error: 'Google sign-in expired or is invalid.' });
    }
  };
}

module.exports = { createAuthMiddleware, normalizeEmail, parseAllowedUsers };
