// Utility functions for secure cookie handling

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomValues = crypto.getRandomValues(new Uint8Array(length * 2)); // Get more values to avoid rejection
  let randomIndex = 0;
  
  for (let i = 0; i < length; i++) {
    let randomValue = randomValues[randomIndex++];
    // Reject and retry to avoid modulo bias
    while (randomValue >= 256 - (256 % possible.length)) {
      if (randomIndex >= randomValues.length) {
        // Get more random values if needed
        const moreValues = crypto.getRandomValues(new Uint8Array(length));
        randomValues.set(moreValues, randomIndex);
      }
      randomValue = randomValues[randomIndex++];
    }
    result += possible[randomValue % possible.length];
  }
  return result;
}

export async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest('SHA-256', data);
}

export function base64encode(input: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const hashed = await sha256(verifier);
  return base64encode(hashed);
}

export async function redirectToSpotifyAuth() {
  try {
    // Use server-side endpoint to set cookie and get auth URL
    const response = await fetch('/api/auth/start', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to initiate authentication');
    }
    
    const data = await response.json();
    
    if (typeof window !== 'undefined') {
      window.location.href = data.authUrl;
    }
  } catch (error) {
    console.error('Auth initiation error:', error);
    throw error;
  }
}

export async function checkAuthStatus(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/status', {
      credentials: 'include'
    });
    const data = await response.json();
    return data.authenticated === true;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    // Clear any client-side state
    deleteCookie('code_verifier');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Legacy function for backward compatibility
export async function getValidAccessToken(): Promise<string | null> {
  const isAuthenticated = await checkAuthStatus();
  return isAuthenticated ? 'authenticated' : null;
}

// Legacy function for backward compatibility
export function clearAuth() {
  logout();
}