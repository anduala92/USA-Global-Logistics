let _accessToken = null;
let _refreshToken = null;

export function setTokens({ accessToken, refreshToken }) {
  if (typeof accessToken === 'string') _accessToken = accessToken;
  if (typeof refreshToken === 'string') _refreshToken = refreshToken;
  const data = { accessToken: _accessToken, refreshToken: _refreshToken };
  try { localStorage.setItem('authTokens', JSON.stringify(data)); } catch {}
}

export function clearTokens() {
  _accessToken = null; _refreshToken = null;
  try { localStorage.removeItem('authTokens'); } catch {}
}

export function loadTokens() {
  try {
    const raw = localStorage.getItem('authTokens');
    if (raw) {
      const data = JSON.parse(raw);
      _accessToken = data.accessToken || null;
      _refreshToken = data.refreshToken || null;
    }
  } catch {}
}

export function getAccessToken() { return _accessToken; }
export function getRefreshToken() { return _refreshToken; }
