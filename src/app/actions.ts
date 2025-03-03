"use server"

export const getAccessToken = async (code: string) => {
  const { access_token } = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000",
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
  const { width, height, term, quality, token } = Object.fromEntries(fd) as {
    [k: string]: string
  }

  const index = { high: 0, medium: 1, low: 2 }[quality] as number
  const qualities = [640, 300, 30]

  const { items } = await fetch(
    "https://api.spotify.com/v1/me/top/tracks?" +
      new URLSearchParams({ limit: "50", time_range: term + "_term" }),
    { headers: { Authorization: "Bearer " + token } },
  ).then((res) => res.json())

  return {
    urls: items.map((item: any) => item.album.images[index].url),
    data: { width: +width, height: +height, quality: qualities[index] },
  }
}
