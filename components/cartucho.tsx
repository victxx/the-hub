"use client"

import { useState } from "react"
import { WalletConnect } from "./wallet-connect"

interface CartuchoProps {
  cartucho: {
    id: string
    title: string
    description: string
    difficulty: string
    timeEstimate: string
  }
}

export function Cartucho({ cartucho }: CartuchoProps) {
  const [showWalletConnect, setShowWalletConnect] = useState(false)

  return (
    <>
      <div className="border-4 border-orange-500 bg-gray-900 p-6 rounded-lg transform transition-all hover:scale-[1.02] hover:border-orange-400 relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          {/* Cartucho "cartridge" visual */}
          <div className="flex-shrink-0 w-full md:w-40 h-40 bg-gray-800 border-4 border-orange-600 flex items-center justify-center rounded-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-700/20 to-orange-500/10"></div>
            <div className="text-3xl font-bold text-orange-400 glow-orange tracking-widest rotate-90 md:rotate-0">
              {cartucho.id}
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-bold text-orange-500 glow-orange tracking-wider mb-2">{cartucho.title}</h2>

            <p className="text-orange-300 mb-6 leading-relaxed">{cartucho.description}</p>

            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-4">
                <span className="px-2 py-1 bg-gray-800 text-orange-300 text-sm rounded">
                  DIFF: {cartucho.difficulty}
                </span>
                <span className="px-2 py-1 bg-gray-800 text-orange-300 text-sm rounded">
                  TIME: {cartucho.timeEstimate}
                </span>
              </div>

              <button
                onClick={() => setShowWalletConnect(true)}
                className="w-full md:w-auto mt-4 md:mt-0 bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-md font-bold tracking-wider transition-all hover:scale-105 text-xl flex items-center justify-center"
              >
                <span className="mr-2">▶</span> PLAY NOW
              </button>
            </div>
          </div>
        </div>
      </div>

      {showWalletConnect && <WalletConnect cartuchoId={cartucho.id} onClose={() => setShowWalletConnect(false)} />}
    </>
  )
}
