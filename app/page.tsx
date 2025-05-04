"use client"

import { CrtEffect } from "@/components/crt-effect"
import { HomeContent } from "@/components/home-content"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <CrtEffect>
      <main className="flex min-h-screen flex-col items-center p-8 md:p-12 bg-transparent">
        {/* Header with logo and wallet button */}
        <Header />

        {/* Home Content with filters */}
        <HomeContent />

        <div className="w-full mt-auto pt-6">
          <div className="flex justify-center items-center">
            <p className="text-center text-orange-300/80 text-xs">
              vibe coded with &lt;3 by <a href="https://www.victordelval.me" target="_blank" rel="noopener noreferrer" className="hover:text-orange-300">victorxva</a> at ETHCincoDeMayo
            </p>
            <span className="mx-2 text-orange-400/40 text-xs">•</span>
            <p className="text-center text-orange-400/60 text-xs">
              THE HUB // SYSTEM V0.8.5
            </p>
          </div>
        </div>
      </main>
    </CrtEffect>
  )
}
