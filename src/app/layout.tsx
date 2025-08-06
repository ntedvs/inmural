import "@/styles/base.css"
import { Metadata } from "next"
import { Geist } from "next/font/google"
import { ReactNode } from "react"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: { default: "Inmural", template: "%s - Inmural" },
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`bg-background text-foreground ${geist.className}`}>
        <main>{children}</main>
      </body>
    </html>
  )
}
