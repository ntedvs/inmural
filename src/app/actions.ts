"use server"

import { domain } from "@/utils"

export const getAccessToken = async (code: string) => {
  const { access_token } = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        redirect_uri: domain,
        code,
      }),
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(process.env.ID + ":" + process.env.SECRET).toString(
            "base64",
          ),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  ).then((res) => res.json())

  return access_token
}

export const getAlbumCovers = async (state: any, fd: FormData) => {
  const {
    width: w,
    height: h,
    term,
    quality,
    token,
  } = Object.fromEntries(fd) as {
    [k: string]: string
  }

  const index = { high: 0, medium: 1, low: 2 }[quality] as number

  const width = +w
  const height = +h

  const total = width * height
  const urls: string[] = []
  const meta: { name: string; uri: string }[] = []

  const fetchAlbumCovers = async (i: number) => {
    const { items } = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${term}_term&offset=${i * 50}`,
      { headers: { Authorization: "Bearer " + token } },
    ).then((res) => res.json())

    items.forEach((item: any) => {
      if (urls.length >= total) return
      const url = item.album.images[index].url

      if (!urls.includes(url)) {
        urls.push(url)
        meta.push({ name: item.album.name, uri: item.album.uri })
      }
    })

    if (urls.length < total) await fetchAlbumCovers(i + 1)
  }

  await fetchAlbumCovers(0)

  return {
    urls,
    meta,
    data: { width, height, quality: [640, 300, 30][index] },
  }
}
