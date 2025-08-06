import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url),
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/?error=No authorization code received", request.url),
    )
  }

  // Server-side token exchange to prevent XSS
  try {
    console.log(request.cookies + ":SLDKJF:LKJ:LKJ")
    const codeVerifier = request.cookies.get("code_verifier")?.value

    // Debug logging
    console.log("All cookies:", request.cookies.getAll())
    console.log("Code verifier from cookie:", codeVerifier)

    if (!codeVerifier) {
      console.log("No code verifier found in cookies")
      return NextResponse.redirect(
        new URL("/?error=Missing code verifier", request.url),
      )
    }

    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
          code_verifier: codeVerifier,
        }),
      },
    )

    if (!tokenResponse.ok) {
      return NextResponse.redirect(
        new URL("/?error=Failed to exchange authorization code", request.url),
      )
    }

    const tokenData = await tokenResponse.json()

    // Create response with secure cookies
    const response = NextResponse.redirect(
      new URL("/?authorized=true", request.url),
    )

    // Set secure, httpOnly cookies for tokens
    const isProduction = process.env.NODE_ENV === "production"
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      path: "/",
      maxAge: tokenData.expires_in,
    }

    response.cookies.set(
      "spotify_access_token",
      tokenData.access_token,
      cookieOptions,
    )
    response.cookies.set("spotify_refresh_token", tokenData.refresh_token, {
      ...cookieOptions,
      maxAge: 365 * 24 * 60 * 60, // 1 year for refresh token
    })
    response.cookies.set(
      "spotify_token_expires",
      String(Date.now() + tokenData.expires_in * 1000),
      cookieOptions,
    )

    // Debug logging
    console.log("Successfully set tokens in cookies")
    console.log("Cookie options:", cookieOptions)

    // Remove code verifier cookie
    response.cookies.delete("code_verifier")

    return response
  } catch {
    return NextResponse.redirect(
      new URL("/?error=Authorization failed", request.url),
    )
  }
}
