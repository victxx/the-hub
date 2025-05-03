"use client"

import { CrtEffect } from "@/components/crt-effect"
import Link from "next/link"
import { GameTimer } from "@/components/game-timer"
import { useRouter } from "next/navigation"

interface PlayPageProps {
  params: {
    id: string
  }
}

export default function PlayPage({ params }: PlayPageProps) {
  const { id } = params
  const router = useRouter()

  const handleOptionClick = (option: string) => {
    // In a real app, this would process the choice and determine outcome
    // For now, we'll just simulate success for option A and defeat for option B
    if (option === "A") {
      router.push("/result/success")
    } else {
      router.push("/result/defeat")
    }
  }

  return (
    <CrtEffect>
      <main className="min-h-screen bg-black text-orange-400 font-mono p-4 md:p-8 flex flex-col relative">
        <div className="container mx-auto flex-1 flex flex-col relative z-10">
          {/* Header with timer */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-orange-500 glow-orange">TRIAL OF FIRE</h1>
            <GameTimer initialTime={300} /> {/* 5 minutes = 300 seconds */}
          </div>

          {/* Game screen */}
          <div className="flex-1 border-4 border-orange-500 bg-gray-900 rounded-lg p-6 mb-6 relative overflow-hidden">
            {/* Scanlines effect */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="h-px bg-orange-400 opacity-10"
                  style={{
                    position: "absolute",
                    top: `${i * 2}%`,
                    left: 0,
                    right: 0,
                  }}
                />
              ))}
            </div>

            {/* Narrative text */}
            <div className="relative z-10 text-lg md:text-xl leading-relaxed mb-8 text-orange-300">
              <p className="mb-4">&gt; SYSTEM BOOT SEQUENCE INITIATED</p>
              <p className="mb-4">
                The heat hits you first - a wave of scorching air that makes your skin tingle. Around you, digital
                flames lick at the edges of reality, casting everything in a flickering orange glow.
              </p>
              <p className="mb-4">The screen flashes: "WELCOME TO THE TRIAL OF FIRE. ONLY THE WORTHY SHALL PASS."</p>
              <p className="mb-4">
                A warning appears: "DANGER: Temperature rising to critical levels. Choose your path carefully."
              </p>
            </div>
          </div>

          {/* Option buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => handleOptionClick("A")}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-6 rounded-md text-xl tracking-wider transition-all hover:scale-105"
            >
              BRAVE THE FLAMES
            </button>
            <button
              onClick={() => handleOptionClick("B")}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-6 rounded-md text-xl tracking-wider transition-all hover:scale-105"
            >
              SEEK SHELTER
            </button>
          </div>

          {/* Return button */}
          <div className="text-center">
            <Link href="/">
              <button className="bg-gray-800 hover:bg-gray-700 text-orange-400 px-4 py-2 rounded-md font-bold tracking-wider transition-all">
                &lt; RETURN TO HUB &gt;
              </button>
            </Link>
          </div>
        </div>
      </main>
    </CrtEffect>
  )
}
