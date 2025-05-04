"use client"

import { CrtEffect } from "@/components/crt-effect"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useStory } from "@/hooks/use-story"
import { Logo } from "@/components/logo"
import { MintNFTButton } from "@/components/mint-nft-button"
import { NetworkSwitcher } from "@/components/network-switcher"

export default function SuccessResultPage() {
  const { state } = useStory();
  const [timeDisplay, setTimeDisplay] = useState("--:--")
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  useEffect(() => {
    // Try to get the time from localStorage
    const storedTime = localStorage.getItem('successTimeRemaining');
    
    if (storedTime) {
      const remainingTime = parseInt(storedTime, 10);
      setTimeRemaining(remainingTime);
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      setTimeDisplay(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    } else if (state.timeRemaining !== null) {
      // Fallback to state if localStorage doesn't have the value
      setTimeRemaining(state.timeRemaining);
      const minutes = Math.floor(state.timeRemaining / 60);
      const seconds = state.timeRemaining % 60;
      setTimeDisplay(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }
  }, [state.timeRemaining]);

  return (
    <CrtEffect>
      <main className="min-h-screen bg-black text-orange-400 font-mono p-4 md:p-8 flex flex-col items-center relative">
        <div className="w-full max-w-2xl mb-8">
          <Logo width={150} height={50} />
        </div>
        
        <div className="container mx-auto max-w-2xl text-center relative z-10 flex-1 flex flex-col justify-center">
          {/* Result animation */}
          <div className="mb-2 relative">
            <div className="text-7xl md:text-9xl font-bold text-orange-500 glow-orange-subtle mb-4 tracking-wider animate-pulse font-psygen">
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

          {/* NFT Minting Message */}
          <div className="mb-8 text-xl text-center text-orange-300 font-psygen glow-orange-subtle">
            Mint your story NFT on your favorite network!
          </div>

          {/* Network switcher and Mint button */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center items-center mb-8">
            <NetworkSwitcher />
            <MintNFTButton outcomeType="victory" timeRemaining={timeRemaining} />
          </div>
          
          {/* Back to the hub button */}
          <div className="mt-6">
            <Link
              href="/"
              className="px-8 py-3 text-lg font-bold text-orange-400 border-2 border-orange-400 hover:bg-orange-400/10 transition-colors rounded-md uppercase tracking-widest"
            >
              Back to The Hub
            </Link>
          </div>
        </div>
      </main>
    </CrtEffect>
  )
}
