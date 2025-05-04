"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { useAccount, useChainId } from "wagmi"
import { toast } from "sonner"
import { Loader2, HelpCircle } from "lucide-react"
import { mintVictoryNFT, mintDefeatNFT, isSupportedNFTNetwork, getExplorerUrl, supportedNFTNetworks } from "@/lib/nft-contract"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

interface MintNFTButtonProps {
  outcomeType: "victory" | "defeat"
  timeRemaining?: number | null
}

export function MintNFTButton({ outcomeType, timeRemaining }: MintNFTButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  
  const isOnSupportedNetwork = isSupportedNFTNetwork(chainId)
  
  // Generate metadata for NFT
  const generateMetadata = () => {
    const timestamp = new Date().toISOString()
    const baseUrl = "https://thehub-meta.vercel.app/api/metadata"
    
    if (outcomeType === "victory") {
      return `${baseUrl}/victory?time=${timeRemaining || 0}&timestamp=${timestamp}`
    } else {
      return `${baseUrl}/defeat?timestamp=${timestamp}`
    }
  }

  const handleMint = async () => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet first")
      return
    }
    
    if (!isOnSupportedNetwork) {
      toast.error("Please use the network switcher to select a supported NFT network")
      return
    }
    
    setIsLoading(true)
    
    try {
      const metadata = generateMetadata()
      
      let txHash: string;
      if (outcomeType === "victory") {
        txHash = await mintVictoryNFT(address, metadata)
        setTransactionHash(txHash)
        toast.success("Victory NFT minting started! Check your wallet for confirmation.")
      } else {
        txHash = await mintDefeatNFT(address, metadata)
        setTransactionHash(txHash)
        toast.success("Defeat NFT minting started! Check your wallet for confirmation.")
      }
    } catch (error: any) {
      console.error("Error minting NFT:", error)
      toast.error(error.message || "Failed to mint NFT. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const buttonText = outcomeType === "victory" ? "Mint Victory NFT" : "Mint Defeat NFT"
  const buttonColor = outcomeType === "victory" ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"

  // Get explorer URL for the current network
  const getTransactionExplorerLink = () => {
    if (!transactionHash || !chainId) return "#";
    const baseUrl = getExplorerUrl(chainId);
    return `${baseUrl}/tx/${transactionHash}`;
  };

  const getSupportedNetworkNames = () => {
    return supportedNFTNetworks.map(network => network.name).join(", ");
  };

  return (
    <div className="flex flex-col space-y-4">
      {transactionHash ? (
        <div className="text-center bg-gray-800/60 p-4 rounded-lg border border-orange-500/20">
          <p className="text-green-400 mb-2">✓ NFT mint transaction submitted!</p>
          <a 
            href={getTransactionExplorerLink()}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 underline hover:text-blue-300 text-sm"
          >
            View on Explorer
          </a>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Button
              onClick={handleMint}
              disabled={isLoading || !isConnected || !isOnSupportedNetwork}
              className={`${isOnSupportedNetwork ? buttonColor : "bg-gray-600"} text-white px-6 py-3 rounded-md text-lg font-bold tracking-wider transition-all flex-1`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : !isOnSupportedNetwork ? (
                <>Switch Network First</>
              ) : (
                buttonText
              )}
            </Button>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2">
                    <HelpCircle className="h-5 w-5 text-orange-400/70" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm bg-gray-900 text-orange-300 border-orange-500/30">
                  <p>Mint an NFT to commemorate your {outcomeType} on one of the supported testnets. Make sure you have ETH or MNT on testnet before minting!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </>
      )}
    </div>
  )
} 