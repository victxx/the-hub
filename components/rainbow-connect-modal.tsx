"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useBalance } from 'wagmi'

interface RainbowConnectModalProps {
  cartuchoId: string
  onClose: () => void
  onConnected?: () => void
  redirectToGame?: boolean
}

export function RainbowConnectModal({ 
  cartuchoId, 
  onClose, 
  onConnected,
  redirectToGame = false 
}: RainbowConnectModalProps) {
  const router = useRouter()
  const { isConnected, address } = useAccount()
  const [connected, setConnected] = useState(false)
  
  // Check CAMP balance
  const { data: balanceData } = useBalance({
    address,
  })

  useEffect(() => {
    if (isConnected && !connected) {
      setConnected(true)
      
      if (onConnected) {
        onConnected()
      }
      
      if (redirectToGame) {
        setTimeout(() => {
          router.push(`/play/${cartuchoId}`)
        }, 1000)
      } else {
        setTimeout(() => {
          onClose()
        }, 1000)
      }
    }
  }, [isConnected, connected, cartuchoId, router, onConnected, redirectToGame, onClose])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="relative bg-gray-900 border-2 border-orange-500 rounded-xl p-6 max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-orange-400 hover:text-orange-300"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-orange-500/70 mb-2">Connect to play!</h2>
        </div>

        <div className="space-y-7 mb-7">
          {!connected ? (
            <>
              <div className="flex justify-center">
                <ConnectButton 
                  chainStatus="icon" 
                  accountStatus="address" 
                  showBalance={true}
                />
              </div>
              
              <div className="text-xs text-orange-400/80 text-center bg-gray-800/50 p-3 rounded-lg border border-orange-500/20">
                <p className="font-bold mb-1">Need CAMP tokens?</p>
                <p>You can get free CAMP tokens from the Base Camp faucet:</p>
                <a 
                  href="https://faucet.campnetwork.xyz/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block mt-2 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded-full text-orange-300 text-xs"
                >
                  Visit Base Camp Faucet
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="text-green-400 mb-2">✓ WALLET CONNECTED</div>
              {balanceData && (
                <div className="text-orange-300 mb-2">
                  Balance: <span className="font-bold">{parseFloat(balanceData.formatted).toFixed(4)} CAMP</span>
                </div>
              )}
              <div className="text-orange-300 text-sm">
                {redirectToGame ? 'Redirecting to game...' : 'Please wait...'}
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-orange-600 text-center">
          By connecting your wallet, you agree to the Terms of Service
        </div>
      </div>
    </div>
  )
}
