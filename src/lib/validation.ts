import type { TimeRange, ImageQuality } from '@/types/spotify';

export function sanitizeErrorMessage(error: string): string {
  // Remove potentially sensitive information
  const sanitized = error
    .replace(/token/gi, 'auth')
    .replace(/key/gi, 'credential')
    .replace(/secret/gi, 'credential')
    .replace(/password/gi, 'credential');
  
  // Only allow alphanumeric characters, spaces, and basic punctuation
  return sanitized.replace(/[^a-zA-Z0-9 .,!?-]/g, '');
}

export function validateMuralDimensions(width: number, height: number): { isValid: boolean; error?: string } {
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return { isValid: false, error: 'Dimensions must be whole numbers' };
  }
  
  if (width < 1 || height < 1) {
    return { isValid: false, error: 'Dimensions must be at least 1x1' };
  }
  
  if (width > 20 || height > 20) {
    return { isValid: false, error: 'Dimensions cannot exceed 20x20' };
  }
  
  const totalCells = width * height;
  if (totalCells > 200) {
    return { isValid: false, error: 'Total mural size cannot exceed 200 albums' };
  }
  
  return { isValid: true };
}

export function validateTimeRange(timeRange: string): timeRange is TimeRange {
  return ['short_term', 'medium_term', 'long_term'].includes(timeRange);
}

export function validateImageQuality(quality: string): quality is ImageQuality {
  return ['low', 'medium', 'high'].includes(quality);
}

export function validateSpotifyParams(params: {
  timeRange: string;
  limit?: number;
  offset?: number;
}): { isValid: boolean; error?: string } {
  if (!validateTimeRange(params.timeRange)) {
    return { isValid: false, error: 'Invalid time range' };
  }
  
  if (params.limit !== undefined) {
    if (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 50) {
      return { isValid: false, error: 'Limit must be between 1 and 50' };
    }
  }
  
  if (params.offset !== undefined) {
    if (!Number.isInteger(params.offset) || params.offset < 0 || params.offset > 200) {
      return { isValid: false, error: 'Offset must be between 0 and 200' };
    }
  }
  
  return { isValid: true };
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false;
  }
  
  entry.count++;
  return true;
}