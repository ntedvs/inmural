import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("spotify_access_token")?.value
  const tokenExpires = request.cookies.get("spotify_token_expires")?.value

  // Debug logging
  console.log("Auth status check - all cookies:", request.cookies.getAll())
  console.log("Access token found:", !!accessToken)
  console.log("Token expires found:", !!tokenExpires)

  if (!accessToken || !tokenExpires) {
    console.log("Missing tokens, returning unauthenticated")
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  // Check if token is expired
  const now = Date.now()
  const expiresAt = parseInt(tokenExpires)

  if (now >= expiresAt) {
    // Try to refresh token
    const refreshToken = request.cookies.get("spotify_refresh_token")?.value

    if (!refreshToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    try {
      const refreshResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }),
        },
      )

      if (!refreshResponse.ok) {
        return NextResponse.json({ authenticated: false }, { status: 401 })
      }

      const tokenData = await refreshResponse.json()

      // Set new cookies
      const response = NextResponse.json({ authenticated: true })
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
      response.cookies.set(
        "spotify_token_expires",
        String(Date.now() + tokenData.expires_in * 1000),
        cookieOptions,
      )

      if (tokenData.refresh_token) {
        response.cookies.set("spotify_refresh_token", tokenData.refresh_token, {
          ...cookieOptions,
          maxAge: 365 * 24 * 60 * 60, // 1 year
        })
      }

      return response
    } catch {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
  }

  return NextResponse.json({ authenticated: true })
}
