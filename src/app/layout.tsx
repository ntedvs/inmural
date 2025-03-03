import "@/styles/base.css"
import { Metadata } from "next"
import { ReactNode } from "react"

export const metadata: Metadata = { title: "Inmural" }

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto my-8 w-4/5 lg:w-3/5">{children}</main>
      </body>
    </html>
  )
}
