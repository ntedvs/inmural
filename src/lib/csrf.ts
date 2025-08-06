// CSRF protection utility
export function generateCSRFToken(): string {
  return crypto.getRandomValues(new Uint32Array(4)).join('-');
}

export function setCSRFToken(): string {
  if (typeof window === 'undefined') return '';
  
  const token = generateCSRFToken();
  const metaTag = document.createElement('meta');
  metaTag.name = 'csrf-token';
  metaTag.content = token;
  document.head.appendChild(metaTag);
  
  return token;
}

export function getCSRFToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag?.getAttribute('content') || null;
}

export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken();
  return storedToken !== null && storedToken === token;
}