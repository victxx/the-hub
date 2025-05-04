"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function MainWalletConnect() {
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted: rainbowMounted,
      }) => {
        const ready = mounted && rainbowMounted
        
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!ready || !account || !chain) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="bg-gray-800 hover:bg-gray-700 text-orange-500 px-3 py-1.5 rounded-full font-bold text-sm transition-all flex items-center gap-1.5 border-2 border-orange-500/50 hover:shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                  >
                    <span>Connect Wallet</span>
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded-full text-orange-400 text-xs flex items-center gap-1 border-2 border-orange-500/30 hover:shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                  >
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="bg-gray-800 hover:bg-gray-700 text-orange-500 px-3 py-1.5 rounded-full font-bold text-sm border-2 border-orange-500/50 hover:shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  )
} 