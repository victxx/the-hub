"use client"

import { useState, useEffect } from "react"
import { useAccount, useSwitchChain } from "wagmi"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { toast } from "sonner"

// Define Base Camp ID
const BASE_CAMP_ID = 123420001114;

export function MainWalletConnect() {
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const { switchChain } = useSwitchChain()
  
  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Automatically switch to Base Camp
  useEffect(() => {
    if (isConnected) {
      try {
        switchChain({ chainId: BASE_CAMP_ID });
      } catch (error) {
        console.error("Error switching to Base Camp:", error);
      }
    }
  }, [isConnected, switchChain]);
  
  if (!mounted) return null
  
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
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

              // Si la red no es Base Camp, intentar cambiar automáticamente
              if (chain.id !== BASE_CAMP_ID) {
                try {
                  switchChain({ chainId: BASE_CAMP_ID });
                  toast.info("Switching to Base Camp for purchasing games...");
                } catch (error) {
                  console.error("Failed to switch network:", error);
                }
              }

              return (
                <div className="flex items-center">
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