"use client"

import { domain } from "@/utils"
import Image from "next/image"
import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import logo from "../../public/logo.png"
import { getAccessToken, getAlbumCovers } from "./actions"

export default function Home() {
  const [token, setToken] = useState("")
  const [{ urls, meta, data }, action, pending] = useActionState(
    getAlbumCovers,
    {
      urls: [],
      meta: [],
      data: { width: 5, height: 5, quality: 300 },
    },
  )

  useEffect(() => {
    const proxy = async () => {
      const params = new URLSearchParams(location.search)

      if (
        params.has("state") &&
        params.get("state") === localStorage.getItem("state")
      ) {
        setToken(await getAccessToken(params.get("code")!))
      }
    }

    proxy()
  }, [])

  const random = () => {
    const possible =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

    let text = ""

    for (let i = 0; i < 16; i++) {
      text += possible[Math.floor(Math.random() * possible.length)]
    }

    return text
  }

  useEffect(() => {
    if (!urls.length) return

    const { width, height, quality } = data
    const canvas = document.querySelector("canvas")!

    canvas.width = width * quality
    canvas.height = height * quality

    urls.forEach((url, i) => {
      const img = document.createElement("img")
      img.src = url

      img.onload = () => {
        canvas
          .getContext("2d")!
          .drawImage(
            img,
            (i % width) * quality,
            Math.floor(i / width) * quality,
          )
      }
    })
  }, [urls])

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Inmural</h1>

        <Image src={logo} alt="Spotify Logo" width={200} />

        <Link
          href="https://github.com/NaeNate/inmural"
          target="_blank"
          className="text-4xl font-bold"
        >
          GitHub
        </Link>
      </div>

      {token ? (
        <>
          <form action={action} className="flex flex-col">
            <label htmlFor="width">Width</label>
            <input
              id="width"
              name="width"
              type="number"
              defaultValue={data.width}
              className="rounded border-2 border-blue-500 p-2"
            />

            <label htmlFor="height">Height</label>
            <input
              id="height"
              name="height"
              type="number"
              defaultValue={data.height}
              className="rounded border-2 border-blue-500 p-2"
            />

            <label htmlFor="term">Term</label>
            <select
              id="term"
              name="term"
              className="h-11 rounded border-2 border-blue-500 p-2"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>

            <label htmlFor="quality">Quality</label>
            <select
              id="quality"
              name="quality"
              defaultValue="medium"
              className="mb-4 h-11 rounded border-2 border-blue-500 p-2"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button
              disabled={pending}
              className="cursor-pointer rounded bg-blue-500 p-2 text-white disabled:cursor-not-allowed disabled:bg-blue-500/80"
            >
              Go
            </button>

            <input name="token" type="hidden" value={token} />
          </form>

          <canvas className="mx-auto mt-4 w-4/5" />

          <div className="mx-auto mt-4 flex w-3/5 flex-wrap justify-center gap-x-4 gap-y-2">
            {meta.map(({ name, uri }, i) => (
              <Link href={uri} key={i}>
                {name}
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => {
              const state = random()

              console.log(domain)
              localStorage.setItem("state", state)
              location.href =
                "https://accounts.spotify.com/authorize?" +
                new URLSearchParams({
                  client_id: "4de1f2bed60e4e0db864610c6ae492f6",
                  response_type: "code",
                  redirect_uri: domain,
                  scope: "user-top-read",
                  state,
                })
            }}
            className="mt-4 cursor-pointer rounded-lg bg-blue-500 p-8 text-2xl font-semibold text-white"
          >
            Sign in with Spotify
          </button>

          <p>
            By using this app, you agree that Spotify provides its services and
            content “as is” without any warranties, including implied warranties
            of merchantability, fitness for a particular purpose, or
            non-infringement. You may not modify, create derivative works of,
            reverse-engineer, decompile, or otherwise attempt to access the
            source code of Spotify&apos;s services or content. You acknowledge
            that the app, not Spotify, is solely responsible for its
            functionality and content. Spotify is a third-party beneficiary of
            this agreement and our privacy policy and has the right to enforce
            these terms directly.
          </p>

          <p>
            This app does not collect or store any personal data. It uses the
            Spotify Web API to access your top songs, which are used solely to
            generate a grid of album covers within the app. No data is shared
            with third parties. We do not use cookies or allow third parties to
            place cookies. For questions about your data or privacy, you can
            contact us via the GitHub link provided on the site. Your use of the
            app is subject to our privacy policy.
          </p>
        </div>
      )}
    </>
  )
}
