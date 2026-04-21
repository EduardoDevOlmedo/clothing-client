export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export function setAuth(user, token) {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
}

export function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

export function isAuthed() {
  return !!localStorage.getItem('token');
}
