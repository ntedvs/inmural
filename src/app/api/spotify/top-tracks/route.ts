import { checkRateLimit, validateSpotifyParams } from "@/lib/validation"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Rate limiting
  const clientIP =
    request.headers.get("x-forwarded-for") || "unknown"
  if (!checkRateLimit(clientIP, 100, 60000)) {
    // 100 requests per minute
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  const accessToken = request.cookies.get("spotify_access_token")?.value

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const timeRange = searchParams.get("time_range") || "medium_term"
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 50)
  const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0)

  // Validate parameters
  const validation = validateSpotifyParams({ timeRange, limit, offset })
  if (!validation.isValid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: "Token expired" }, { status: 401 })
      }
      return NextResponse.json(
        { error: "Failed to fetch tracks" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
