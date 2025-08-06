import Link from "next/link"

export default function Privacy() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <header className="mb-12">
            <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
            <p className="text-foreground/70">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </header>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">What We Do</h2>
              <p className="mb-4">
                Inmural is a web application that creates visual murals from
                your Spotify music library. We connect to your Spotify account
                to access your top tracks and create personalized album cover
                grids.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">Data We Access</h2>
              <p className="mb-4">
                We request the following permissions from Spotify:
              </p>
              <ul className="mb-4 list-disc pl-6">
                <li>
                  <strong>user-top-read:</strong> Access to your top artists and
                  tracks to create your mural
                </li>
              </ul>
              <p className="mb-4">
                We only request the minimum permissions needed to provide our
                service. We do not access your playlists, saved music, or any
                other personal data beyond your top tracks.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                How We Handle Your Data
              </h2>
              <ul className="mb-4 list-disc pl-6">
                <li>
                  We do not store your personal information on our servers
                </li>
                <li>
                  We store temporary access tokens in secure, httpOnly cookies that cannot be accessed by JavaScript
                </li>
                <li>
                  We fetch your top tracks data only when you generate a mural
                </li>
                <li>
                  Album artwork and metadata are provided directly by Spotify
                </li>
                <li>
                  We do not sell, share, or distribute your data to third
                  parties
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">Your Control</h2>
              <p className="mb-4">You have full control over your data:</p>
              <ul className="mb-4 list-disc pl-6">
                <li>
                  You can disconnect your Spotify account at any time using the
                  &ldquo;Logout&rdquo; button
                </li>
                <li>
                  When you logout, all stored tokens are removed from your
                  browser
                </li>
                <li>
                  You can revoke our access through your Spotify account
                  settings
                </li>
                <li>No data persists after you disconnect your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                Third-Party Services
              </h2>
              <p className="mb-4">
                We use Spotify&apos;s Web API to access your music data. Your
                use of Spotify is governed by{" "}
                <a
                  href="https://www.spotify.com/legal/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Spotify&apos;s Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="https://www.spotify.com/legal/end-user-agreement/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </a>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">Security</h2>
              <p className="mb-4">
                We use industry-standard security measures including HTTPS
                encryption, OAuth 2.0 with PKCE for secure authentication,
                Content Security Policy headers, and secure httpOnly cookies. We
                do not store passwords or sensitive personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">Contact</h2>
              <p className="mb-4">
                If you have questions about this privacy policy, please contact
                us through our{" "}
                <Link
                  href="https://github.com/ntedvs/inmural"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub repository
                </Link>
                .
              </p>
            </section>
          </div>

          <div className="mt-12 border-t border-primary/20 pt-8">
            <Link
              href="/"
              className="inline-flex items-center text-primary hover:underline"
            >
              ← Back to Inmural
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
