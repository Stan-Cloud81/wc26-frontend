export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const getAuthToken = () => {
  return localStorage.getItem('wc26_auth_token');
};

export const setAuthToken = (token) => {
  localStorage.setItem('wc26_auth_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('wc26_auth_token');
};
