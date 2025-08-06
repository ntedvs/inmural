import { generateRandomString } from "@/lib/spotify-auth"
import { NextResponse } from "next/server"

// Helper functions needed in this file
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return await crypto.subtle.digest("SHA-256", data)
}

function base64encode(input: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const hashed = await sha256(verifier)
  return base64encode(hashed)
}

export async function POST() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing configuration" },
      { status: 500 },
    )
  }

  const codeVerifier = generateRandomString(128)
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  const authUrl = new URL("https://accounts.spotify.com/authorize")
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("scope", "user-top-read")
  authUrl.searchParams.set("code_challenge_method", "S256")
  authUrl.searchParams.set("code_challenge", codeChallenge)
  authUrl.searchParams.set("redirect_uri", redirectUri)

  // Create response with the auth URL
  const response = NextResponse.json({ authUrl: authUrl.toString() })

  // Set the code verifier cookie server-side
  const isProduction = process.env.NODE_ENV === "production"
  response.cookies.set("code_verifier", codeVerifier, {
    httpOnly: false, // Client needs to be able to verify it exists
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  })

  return response
}
