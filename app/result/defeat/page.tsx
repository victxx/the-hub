"use client"

import { CrtEffect } from "@/components/crt-effect"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { MintNFTButton } from "@/components/mint-nft-button"
import { NetworkSwitcher } from "@/components/network-switcher"

export default function DefeatResultPage() {
  return (
    <CrtEffect>
      <main className="min-h-screen bg-black text-orange-400 font-mono p-4 md:p-8 flex flex-col items-center relative">
        <div className="w-full max-w-2xl mb-8">
          <Logo width={150} height={50} />
        </div>
        
        <div className="container mx-auto max-w-2xl text-center relative z-10 flex-1 flex flex-col justify-center">
          {/* Result animation */}
          <div className="mb-2 relative">
            <div className="text-7xl md:text-9xl font-bold text-red-500 glow-red-subtle mb-4 tracking-wider animate-pulse font-psygen">
              DEFEAT
            </div>
          </div>

          {/* Result description */}
          <div className="border-2 border-red-500 bg-gray-900 p-6 rounded-lg mb-12 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xl md:text-2xl text-orange-300 mb-6 leading-relaxed">
                The flames consumed you, leaving nothing but digital ash. The Trial of Fire has proven too much for your
                mortal code. You have fallen.
              </p>
              <p className="text-lg text-red-400">MISSION FAILED: TIME EXPIRED</p>
            </div>
          </div>

          {/* NFT Minting Message */}
          <div className="mb-8 text-xl text-center text-orange-300 font-psygen glow-orange-subtle">
            Mint your story NFT on your favorite network!
          </div>

          {/* Network switcher and Mint button */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center items-center mb-8">
            <NetworkSwitcher />
            <MintNFTButton outcomeType="defeat" />
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
