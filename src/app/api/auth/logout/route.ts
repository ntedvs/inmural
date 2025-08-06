import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Delete all auth cookies
  response.cookies.delete('spotify_access_token');
  response.cookies.delete('spotify_refresh_token');
  response.cookies.delete('spotify_token_expires');
  response.cookies.delete('code_verifier');
  
  return response;
}