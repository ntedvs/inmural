"use client"

import Link from "next/link"
import MuralGrid from "@/components/MuralGrid"
import { fetchUniqueAlbumCovers } from "@/lib/spotify-api"
import {
  clearAuth,
  checkAuthStatus,
  redirectToSpotifyAuth,
} from "@/lib/spotify-auth"
import type { AlbumCover, ImageQuality, TimeRange } from "@/types/spotify"
import { useEffect, useState } from "react"
import { validateMuralDimensions, validateImageQuality, validateTimeRange, sanitizeErrorMessage } from "@/lib/validation"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [muralWidth, setMuralWidth] = useState(5)
  const [muralHeight, setMuralHeight] = useState(5)
  const [quality, setQuality] = useState<ImageQuality>("medium")
  const [timeFrame, setTimeFrame] = useState<TimeRange>("medium_term")

  const [albumCovers, setAlbumCovers] = useState<AlbumCover[]>([])
  const [showMural, setShowMural] = useState(false)

  useEffect(() => {
    checkAuthentication()

    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("authorized") === "true") {
      setIsAuthenticated(true)
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    const errorParam = urlParams.get("error")
    if (errorParam) {
      setError(errorParam)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const checkAuthentication = async () => {
    const isAuthenticated = await checkAuthStatus()
    setIsAuthenticated(isAuthenticated)
  }

  const handleLogin = () => {
    redirectToSpotifyAuth()
  }

  const handleLogout = () => {
    clearAuth()
    setIsAuthenticated(false)
    setShowMural(false)
    setAlbumCovers([])
  }

  const handleGenerateMural = async () => {
    // Validate inputs
    const dimensionValidation = validateMuralDimensions(muralWidth, muralHeight);
    if (!dimensionValidation.isValid) {
      setError(dimensionValidation.error!);
      return;
    }
    
    if (!validateImageQuality(quality)) {
      setError('Invalid image quality selected');
      return;
    }
    
    if (!validateTimeRange(timeFrame)) {
      setError('Invalid time frame selected');
      return;
    }

    setLoading(true)
    setError(null)

    try {
      const covers = await fetchUniqueAlbumCovers(
        muralWidth,
        muralHeight,
        quality,
        timeFrame,
      )

      setAlbumCovers(covers)
      setShowMural(true)
    } catch (err) {
      let errorMessage = "Failed to generate mural"

      if (err instanceof Error) {
        if (
          err.message.includes("Unauthorized") ||
          err.message.includes("Not authenticated")
        ) {
          setIsAuthenticated(false)
          errorMessage =
            "Your session has expired. Please reconnect your account."
        } else if (err.message.includes("Failed to fetch")) {
          errorMessage =
            "Network error. Please check your connection and try again."
        } else {
          errorMessage = sanitizeErrorMessage(err.message)
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadMural = () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const imageSize = quality === "low" ? 64 : quality === "medium" ? 300 : 640
    canvas.width = muralWidth * imageSize
    canvas.height = muralHeight * imageSize

    let loadedImages = 0
    const totalImages = albumCovers.length

    albumCovers.forEach((cover, index) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        const x = (index % muralWidth) * imageSize
        const y = Math.floor(index / muralWidth) * imageSize
        ctx.drawImage(img, x, y, imageSize, imageSize)

        loadedImages++
        if (loadedImages === totalImages) {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `spotify-mural-${muralWidth}x${muralHeight}.png`
              a.click()
              URL.revokeObjectURL(url)
            }
          })
        }
      }

      img.src = cover.imageUrl
    })
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-16 text-center">
          <h1 className="mb-4 text-6xl font-bold text-foreground">Inmural</h1>
          <p className="text-xl opacity-80">
            Create a mural with your favorite album covers
          </p>
        </header>

        {error && (
          <div className="mx-auto mb-6 max-w-md border border-red-500/50 bg-red-500/10 p-4">
            <p className="text-center text-red-600">{error}</p>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="mx-auto max-w-lg text-center">
            <div className="mb-8 border border-primary/20 bg-white/80 p-6 backdrop-blur">
              <h2 className="mb-4 text-xl font-semibold">
                Connect Your Spotify Account
              </h2>
              <p className="mb-4 text-sm text-foreground/70">
                To create your album mural, we need access to your top tracks
                from Spotify.
              </p>

              <div className="mt-6 mb-8">
                <p className="mb-1 text-sm font-semibold">
                  We will request permission to:
                </p>
                <ul className="space-y-1 text-sm text-foreground/70">
                  <li>• View your top artists and tracks</li>
                  <li>• Access album artwork and metadata</li>
                </ul>
              </div>

              <div className="mb-6 space-y-1 text-xs text-foreground/60">
                <p>
                  We do not store your personal data. You can revoke access at
                  any time.
                </p>
                <p>
                  Read our{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                </p>
              </div>
              <button
                onClick={handleLogin}
                className="bg-primary px-10 py-4 text-lg font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-primary/90"
              >
                Connect with Spotify
              </button>
            </div>
          </div>
        ) : !showMural ? (
          <div className="mx-auto max-w-md border border-primary/20 bg-white/80 p-10 shadow-xl backdrop-blur">
            <div className="space-y-8">
              <div>
                <label className="mb-3 block text-sm font-semibold text-foreground">
                  Mural Dimensions
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={muralWidth}
                    onChange={(e) => setMuralWidth(Number(e.target.value))}
                    className="w-20 border-2 border-primary/30 bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                  <span className="font-semibold text-foreground/60">×</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={muralHeight}
                    onChange={(e) => setMuralHeight(Number(e.target.value))}
                    className="w-20 border-2 border-primary/30 bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                  <span className="ml-2 text-foreground/60">
                    = {muralWidth * muralHeight} albums
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-foreground">
                  Image Quality
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as ImageQuality)}
                  className="w-full border-2 border-primary/30 bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="low">Low (64×64 px)</option>
                  <option value="medium">Medium (300×300 px)</option>
                  <option value="high">High (640×640 px)</option>
                </select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-foreground">
                  Time Frame
                </label>
                <select
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value as TimeRange)}
                  className="w-full border-2 border-primary/30 bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="short_term">Short (Last 4 weeks)</option>
                  <option value="medium_term">Medium (Last 6 months)</option>
                  <option value="long_term">Long (Last year)</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleGenerateMural}
                  disabled={loading}
                  className="flex-1 bg-primary px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-primary/90 disabled:bg-foreground/30"
                >
                  {loading ? "Generating..." : "Generate Mural"}
                </button>
                <div className="group relative">
                  <button
                    onClick={handleLogout}
                    className="bg-foreground/10 px-6 py-3 font-semibold text-foreground transition-colors duration-200 hover:bg-foreground/20"
                  >
                    Disconnect
                  </button>
                  <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded bg-foreground px-3 py-1 text-xs whitespace-nowrap text-background opacity-0 transition-opacity group-hover:opacity-100">
                    Removes all stored data
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-x-4 text-center">
              <button
                onClick={() => setShowMural(false)}
                className="bg-foreground/10 px-6 py-2 font-semibold text-foreground transition-colors duration-200 hover:bg-foreground/20"
              >
                ← Back
              </button>
              <button
                onClick={handleDownloadMural}
                className="bg-primary px-6 py-2 font-semibold text-white transition-colors duration-200 hover:bg-primary/90"
              >
                Download Mural
              </button>
            </div>

            <MuralGrid
              covers={albumCovers}
              width={muralWidth}
              height={muralHeight}
            />
          </div>
        )}
      </div>

      <footer className="border-t border-primary/20 bg-white/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-foreground/70 transition-colors hover:text-primary"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-foreground/70 transition-colors hover:text-primary"
              >
                Terms of Service
              </Link>
              <a
                href="https://github.com/ntedvs/inmural"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-foreground/70 transition-colors hover:text-primary"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>
            <p className="text-xs text-foreground/50">
              Content provided by Spotify. Not affiliated with Spotify.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
