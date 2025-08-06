import type { AlbumCover } from "@/types/spotify"
import Image from "next/image"

interface MuralGridProps {
  covers: AlbumCover[]
  width: number
  height: number
}

export default function MuralGrid({ covers, width, height }: MuralGridProps) {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${width}, 1fr)`,
    gridTemplateRows: `repeat(${height}, 1fr)`,
    width: "100%",
    maxWidth: "1200px",
    aspectRatio: `${width} / ${height}`,
  }

  return (
    <div className="flex w-full flex-col items-center p-4">
      <div className="mb-4 flex items-center gap-2 text-sm text-foreground/70">
        <span>Content provided by</span>
        <Image src="/spotify.svg" alt="Spotify" width={24} height={24} />
      </div>
      <div style={gridStyle} className="overflow-hidden bg-black">
        {covers.map((cover, index) => {
          const CoverContent = (
            <>
              <Image
                src={cover.imageUrl}
                alt={`${cover.name} by ${cover.artistName}`}
                width={300}
                height={300}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                style={{ borderRadius: "2px" }}
              />
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:bg-black/70">
                <div className="p-2 text-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="truncate text-sm font-semibold">{cover.name}</p>
                  <p className="truncate text-xs">{cover.artistName}</p>
                  {cover.externalUrl && (
                    <p className="mt-2 text-xs opacity-75">
                      Click to open in Spotify
                    </p>
                  )}
                </div>
              </div>
            </>
          )

          return cover.externalUrl ? (
            <a
              key={`${cover.id}-${index}`}
              href={cover.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden"
              style={{ borderRadius: "2px" }}
            >
              {CoverContent}
            </a>
          ) : (
            <div
              key={`${cover.id}-${index}`}
              className="group relative overflow-hidden"
              style={{ borderRadius: "2px" }}
            >
              {CoverContent}
            </div>
          )
        })}
      </div>
    </div>
  )
}
