"use client"

import { CrtEffect } from "@/components/crt-effect"
import Link from "next/link"
import { useState } from "react"
import { registerCartucho } from "@/lib/contract"
import { useAccount } from "wagmi"
import { toast } from "sonner"
import { Logo } from "@/components/logo"

export default function DefeatResultPage() {
  const [minting, setMinting] = useState(false)
  const [minted, setMinted] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const { address } = useAccount()

  const handleMintNFT = async () => {
    if (!address) {
      toast.error("Please connect your wallet to mint an NFT");
      return;
    }
    
    setMinting(true);
    
    try {
      // IPFS CID suffix of the JSON metadata of the NFT (would need to be stored on IPFS first)
      const cidSuffix = "bafybeihsvpxlhwzb4xzqfvqm7gyxaqgqkvzkerkf563q6evubage2v2dna.json";
      
      // Allow commercial use, disallow derivative works, expire in 30 days
      const allowCommercialUse = true;
      const allowDerivativeWorks = false;
      const expiry = Math.floor(Date.now()/1000) + 30*24*3600; // 30 days from now
      
      const hash = await registerCartucho(
        address,             // The connected user's address
        cidSuffix,           // IPFS CID suffix
        allowCommercialUse,  // Allow commercial use
        allowDerivativeWorks, // Don't allow derivative works
        expiry               // Expiry timestamp
      );
      
      setTxHash(hash);
      setMinted(true);
      toast.success("NFT minted successfully!");
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error("Failed to mint NFT. Please try again.");
    } finally {
      setMinting(false);
    }
  };

  return (
    <CrtEffect>
      <main className="min-h-screen bg-black text-orange-400 font-mono p-4 md:p-8 flex flex-col items-center relative">
        <div className="w-full max-w-2xl mb-8">
          <Logo width={150} height={50} />
        </div>
        
        <div className="container mx-auto max-w-2xl text-center relative z-10 flex-1 flex flex-col justify-center">
          {/* Result animation */}
          <div className="mb-12 relative">
            <div className="text-6xl md:text-8xl font-bold text-red-500/70 glow-orange mb-8 tracking-wider animate-pulse font-psygen">
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

          {/* NFT Minting Button */}
          <div className="mb-8">
            <button
              onClick={handleMintNFT}
              disabled={minting || minted}
              className={`bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-md text-xl font-bold tracking-wider transition-all hover:scale-105 mb-4 ${
                minting || minted ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {minting ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  MINTING FALLEN NFT...
                </span>
              ) : minted ? (
                "NFT MINTED SUCCESSFULLY!"
              ) : (
                "MINT FALLEN NFT"
              )}
            </button>

            {minted && (
              <p className="text-green-400 text-sm">
                Your FALLEN NFT has been minted to your wallet as a reminder of your defeat.
                {txHash && (
                  <a 
                    href={`https://basecamp.cloud.blockscout.com/tx/${txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline ml-1"
                  >
                    View on Blockscout
                  </a>
                )}
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
