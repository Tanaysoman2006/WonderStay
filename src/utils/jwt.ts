export function getStoredToken(): string | null {
  try {
    return localStorage.getItem('wonderstay_jwt_token');
  } catch {
    return null;
  }
}

export function storeToken(token: string): void {
  localStorage.setItem('wonderstay_jwt_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('wonderstay_jwt_token');
}
