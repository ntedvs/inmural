"use client"

import { domain } from "@/utils"
import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { getAccessToken, getAlbumCovers } from "./actions"

export default function Home() {
  const [token, setToken] = useState("")
  const [{ urls, data }, action, pending] = useActionState(getAlbumCovers, {
    urls: new Set(),
    data: { width: 5, height: 5, quality: 300 },
  })

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
    if (!urls.size) return

    const { width, height, quality } = data
    const canvas = document.querySelector("canvas")!

    canvas.width = width * quality
    canvas.height = height * quality

    Array.from(urls as Set<string>).forEach((url, i) => {
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

        <Link
          href="https://github.com/NaeNate/inmural"
          target="_blank"
          className="text-2xl font-semibold underline"
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
              className="cursor-pointer rounded bg-blue-500 p-2 text-white"
            >
              Go
            </button>

            <input name="token" type="hidden" value={token} />
          </form>

          <canvas className="mx-auto mt-4 w-4/5" />
        </>
      ) : (
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
          className="cursor-pointer rounded bg-blue-500 p-2 text-white"
        >
          Sign in with Spotify
        </button>
      )}
    </>
  )
}
