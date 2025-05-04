"use client"

import { CrtEffect } from "@/components/crt-effect"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useStory } from "@/hooks/use-story"
import { Logo } from "@/components/logo"

export default function SuccessResultPage() {
  const { state } = useStory();
  const [minting, setMinting] = useState(false)
  const [minted, setMinted] = useState(false)
  const [timeDisplay, setTimeDisplay] = useState("--:--")

  useEffect(() => {
    // Try to get the time from localStorage
    const storedTime = localStorage.getItem('successTimeRemaining');
    
    if (storedTime) {
      const timeRemaining = parseInt(storedTime, 10);
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      setTimeDisplay(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    } else if (state.timeRemaining !== null) {
      // Fallback to state if localStorage doesn't have the value
      const minutes = Math.floor(state.timeRemaining / 60);
      const seconds = state.timeRemaining % 60;
      setTimeDisplay(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }
  }, [state.timeRemaining]);

  const handleMintNFT = () => {
    setMinting(true)

    // Simulate minting process
    setTimeout(() => {
      setMinting(false)
      setMinted(true)
    }, 2000)
  }

  return (
    <CrtEffect>
      <main className="min-h-screen bg-black text-orange-400 font-mono p-4 md:p-8 flex flex-col items-center relative">
        <div className="w-full max-w-2xl mb-8">
          <Logo width={150} height={50} />
        </div>
        
        <div className="container mx-auto max-w-2xl text-center relative z-10 flex-1 flex flex-col justify-center">
          {/* Result animation */}
          <div className="mb-12 relative">
            <div className="text-6xl md:text-8xl font-bold text-orange-500/70 glow-orange mb-8 tracking-wider animate-pulse font-psygen">
              SURVIVOR
            </div>
          </div>

          {/* Result description */}
          <div className="border-2 border-orange-500 bg-gray-900 p-6 rounded-lg mb-12 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xl md:text-2xl text-orange-300 mb-6 leading-relaxed">
                You emerged from the inferno unscathed, your spirit tempered by the flames. The Trial of Fire has tested
                your resolve and found you worthy.
              </p>
              <p className="text-lg text-orange-400">MISSION COMPLETE: {timeDisplay}</p>
            </div>
          </div>

          {/* NFT Minting Button */}
          <div className="mb-8">
            <button
              onClick={handleMintNFT}
              disabled={minting || minted}
              className={`bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-md text-xl font-bold tracking-wider transition-all hover:scale-105 mb-4 ${
                minting || minted ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {minting ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  MINTING SURVIVOR NFT...
                </span>
              ) : minted ? (
                "NFT MINTED SUCCESSFULLY!"
              ) : (
                "MINT SURVIVOR NFT"
              )}
            </button>

            {minted && (
              <p className="text-green-400 text-sm">
                Congratulations! Your SURVIVOR NFT has been minted to your wallet.
              </p>
            )}
          </div>

          {/* Return button */}
          <Link href="/">
            <button className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-md text-xl font-bold tracking-wider transition-all hover:scale-105">
              RETURN TO HUB
            </button>
          </Link>
        </div>
      </main>
    </CrtEffect>
  )
}
