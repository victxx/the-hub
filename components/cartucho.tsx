"use client"

import { useState } from "react"
import { RainbowConnectModal } from "./rainbow-connect-modal"
import { BuyCartucho } from "./buy-cartucho"
import { useAccount } from "wagmi"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface CartuchoProps {
  cartucho: {
    id: string
    title: string
    description: string
    difficulty: string
    timeEstimate: string
    price?: string // Price in CAMP
    comingSoon?: boolean // Flag for upcoming cartuchos
  }
}

export function Cartucho({ cartucho }: CartuchoProps) {
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showBuyDialog, setShowBuyDialog] = useState(false)
  const [isOwned, setIsOwned] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const { address, isConnected } = useAccount()
  
  // Determine which image to use based on cartucho ID
  const getCartuchoImage = () => {
    if (cartucho.id === "002") {
      return "/5DEMAYO.webp"
    }
    return "/FIRE 01.webp" // Default image
  }

  // Check if the user already owns this cartucho
  const checkOwnership = async () => {
    if (!isConnected || !address) return false
    
    setIsChecking(true)
    try {
      // Usar localStorage para verificar la propiedad
      const ownedCartuchos = JSON.parse(localStorage.getItem('ownedCartuchos') || '[]');
      const owned = ownedCartuchos.includes(cartucho.id);
      
      setIsOwned(owned)
      return owned
    } catch (error) {
      console.error("Error checking cartucho ownership:", error)
      return false
    } finally {
      setIsChecking(false)
    }
  }
  
  const handlePlay = async () => {
    // Don't do anything if it's a coming soon cartucho
    if (cartucho.comingSoon) {
      return
    }
    
    if (!isConnected) {
      setShowWalletModal(true)
      return
    }
    
    // If we haven't checked ownership yet, do so now
    if (isOwned === null) {
      const owned = await checkOwnership()
      if (!owned) {
        setShowBuyDialog(true)
        return
      }
    } else if (!isOwned) {
      setShowBuyDialog(true)
      return
    }
    
    // If we reach here, the user owns the cartucho and can play
    setShowWalletModal(true)
  }
  
  const handleBuySuccess = () => {
    setShowBuyDialog(false)
    setIsOwned(true)
    toast.success(`You now own ${cartucho.title}!`)
    
    // Allow the user to play right away
    setTimeout(() => {
      setShowWalletModal(true)
    }, 1000)
  }

  return (
    <>
      <div className="border-2 border-orange-500 bg-gray-900 p-6 rounded-xl transition-all hover:scale-[1.01] hover:border-orange-400 relative overflow-hidden hover:shadow-[inset_0_0_8px_rgba(255,128,0,0.3),0_0_15px_rgba(255,128,0,0.2)]">
        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          {/* Cartucho "cartridge" visual */}
          <div className="flex-shrink-0 w-full md:w-44 h-44 bg-transparent flex items-center justify-center rounded-lg relative overflow-hidden group">
            <div className="relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:brightness-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] group-hover:drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]">
              <Image 
                src={getCartuchoImage()}
                alt={cartucho.title} 
                width={145} 
                height={145}
                className="object-contain animate-pulse-slow"
                priority
              />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-bold text-orange-500 tracking-wider mb-2 font-psygen">{cartucho.title}</h2>

            <p className="text-orange-300 mb-6 leading-relaxed">{cartucho.description}</p>

            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-gray-800 text-orange-300 text-sm rounded-full border border-orange-500/30">
                  DIFF: {cartucho.difficulty}
                </span>
                <span className="px-3 py-1 bg-gray-800 text-orange-300 text-sm rounded-full border border-orange-500/30">
                  TIME: {cartucho.timeEstimate}
                </span>
                {cartucho.price && !cartucho.comingSoon && (
                  <span className="px-3 py-1 bg-gray-800 text-green-300 text-sm rounded-full border border-orange-500/30">
                    PRICE: {cartucho.price} CAMP
                  </span>
                )}
              </div>

              <button
                onClick={handlePlay}
                disabled={isChecking || cartucho.comingSoon}
                className={`w-full md:w-auto mt-4 md:mt-0 px-8 py-3 rounded-full font-bold tracking-wider transition-all ${!cartucho.comingSoon && 'hover:scale-105'} text-2xl flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed border-2 ${
                  cartucho.comingSoon
                    ? "bg-gray-700 text-gray-300 border-gray-500 cursor-not-allowed opacity-80"
                    : isOwned 
                      ? "bg-gray-800 hover:bg-gray-700 text-orange-500 border-orange-500/50 hover:shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                      : "bg-orange-600 hover:bg-orange-500 text-white border-orange-600 hover:shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                }`}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    CHECKING...
                  </>
                ) : cartucho.comingSoon ? (
                  "COMING SOON"
                ) : isOwned ? (
                  <>
                    <span className="mr-2">▶</span> PLAY NOW
                  </>
                ) : (
                  <>
                    <span className="mr-2">▶</span> {cartucho.price ? "BUY & PLAY" : "PLAY NOW"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showWalletModal && !cartucho.comingSoon && (
        <RainbowConnectModal 
          cartuchoId={cartucho.id} 
          onClose={() => setShowWalletModal(false)} 
        />
      )}
      
      {showBuyDialog && cartucho.price && !cartucho.comingSoon && (
        <BuyCartucho 
          cartuchoId={cartucho.id}
          cartuchoTitle={cartucho.title}
          price={cartucho.price}
          isOpen={showBuyDialog}
          onClose={() => setShowBuyDialog(false)}
          onSuccess={handleBuySuccess}
        />
      )}
    </>
  )
}