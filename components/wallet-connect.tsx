"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

interface WalletConnectProps {
  cartuchoId: string
  onClose: () => void
}

export function WalletConnect({ cartuchoId, onClose }: WalletConnectProps) {
  const router = useRouter()
  const { isConnected } = useAccount()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (isConnected && !connected) {
      setConnected(true)
      
      // Redirect to game after successful connection
      setTimeout(() => {
        router.push(`/play/${cartuchoId}`)
      }, 1000)
    }
  }, [isConnected, connected, cartuchoId, router])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="relative bg-gray-900 border-4 border-orange-500 rounded-lg p-6 max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-orange-400 hover:text-orange-300"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-orange-500 glow-orange mb-2">CONNECT WALLET</h2>
          <p className="text-orange-300">Connect your wallet to play TRIAL OF FIRE</p>
        </div>

        <div className="space-y-4 mb-6">
          {!connected ? (
            <div className="flex justify-center">
              <ConnectButton 
                chainStatus="none" 
                accountStatus="address" 
                showBalance={false}
                label="CONNECT WITH WALLET"
              />
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="text-green-400 mb-2">✓ WALLET CONNECTED</div>
              <div className="text-orange-300 text-sm">Redirecting to game...</div>
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
