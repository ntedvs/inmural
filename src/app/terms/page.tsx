import Link from "next/link"

export default function Terms() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <header className="mb-12">
            <h1 className="mb-4 text-4xl font-bold">Terms of Service</h1>
            <p className="text-foreground/70">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </header>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                Acceptance of Terms
              </h2>
              <p className="mb-4">
                By using Inmural, you agree to these Terms of Service and our
                Privacy Policy. If you do not agree to these terms, please do
                not use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                Description of Service
              </h2>
              <p className="mb-4">
                Inmural is a web application that creates visual murals using
                album artwork from your Spotify top tracks. The service is
                provided for personal, non-commercial use only.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                Spotify Integration
              </h2>
              <p className="mb-4">
                Our service integrates with Spotify&apos;s Web API. By using
                Inmural, you also agree to:
              </p>
              <ul className="mb-4 list-disc pl-6">
                <li>
                  <a
                    href="https://www.spotify.com/legal/end-user-agreement/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Spotify&apos;s Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.spotify.com/legal/privacy-policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Spotify&apos;s Privacy Policy
                  </a>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                User Responsibilities
              </h2>
              <ul className="mb-4 list-disc pl-6">
                <li>
                  You must have a valid Spotify account to use our service
                </li>
                <li>
                  You are responsible for maintaining the security of your
                  account
                </li>
                <li>
                  You may only use the service for personal, non-commercial
                  purposes
                </li>
                <li>
                  You may not attempt to reverse engineer or misuse our service
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                Content and Intellectual Property
              </h2>
              <p className="mb-4">
                All album artwork, track names, and artist information are
                provided by Spotify and owned by their respective rights
                holders. We do not claim ownership of any content accessed
                through Spotify&apos;s API.
              </p>
              <p className="mb-4">
                The murals you create are for your personal use. You may
                download and use them according to Spotify&apos;s terms and
                applicable copyright laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                Service Availability
              </h2>
              <p className="mb-4">
                We strive to maintain service availability but do not guarantee
                uninterrupted access. The service may be temporarily unavailable
                due to maintenance, updates, or issues beyond our control.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                Limitation of Liability
              </h2>
              <p className="mb-4">
                Inmural is provided &ldquo;as is&rdquo; without warranties of
                any kind. We are not liable for any damages arising from your
                use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">Changes to Terms</h2>
              <p className="mb-4">
                We may update these terms from time to time. Continued use of
                the service after changes constitutes acceptance of the new
                terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">Contact</h2>
              <p className="mb-4">
                For questions about these terms, please contact us through our{" "}
                <a
                  href="https://github.com/ntedvs/inmural"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub repository
                </a>
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
