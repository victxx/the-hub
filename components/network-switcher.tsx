"use client"

import { useMemo, useState } from "react"
import { useChainId } from "wagmi"
import { Button } from "./ui/button"
import { scrollSepolia, arbitrumSepolia, mantleTestnet, supportedNFTNetworks, isSupportedNFTNetwork } from "@/lib/nft-contract"
import { toast } from "sonner"
import { ChevronDownIcon, CheckIcon } from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu"

// Define Base Camp testnet chain
const baseCamp = {
  id: 123420001114,
  name: 'Base Camp',
};

export function NetworkSwitcher() {
  const chainId = useChainId()
  const [isPending, setIsPending] = useState(false)

  const networks = useMemo(() => [
    {
      id: scrollSepolia.id,
      name: scrollSepolia.name,
      icon: "📜",
      description: "Scroll Sepolia - For minting game outcome NFTs",
      rpcUrls: scrollSepolia.rpcUrls.default.http,
      blockExplorerUrl: scrollSepolia.blockExplorers?.default.url,
      nativeCurrency: scrollSepolia.nativeCurrency
    },
    {
      id: arbitrumSepolia.id,
      name: arbitrumSepolia.name,
      icon: "🔵",
      description: "Arbitrum Sepolia - For minting game outcome NFTs",
      rpcUrls: arbitrumSepolia.rpcUrls.default.http,
      blockExplorerUrl: arbitrumSepolia.blockExplorers?.default.url,
      nativeCurrency: arbitrumSepolia.nativeCurrency
    },
    {
      id: mantleTestnet.id,
      name: mantleTestnet.name,
      icon: "🟣",
      description: "Mantle Sepolia - For minting game outcome NFTs",
      rpcUrls: mantleTestnet.rpcUrls.default.http,
      blockExplorerUrl: mantleTestnet.blockExplorers?.default.url,
      nativeCurrency: mantleTestnet.nativeCurrency
    }
  ], [])

  const currentNetwork = useMemo(() => {
    const activeChain = networks.find(network => network.id === chainId)
    return activeChain || { name: "Select Network", icon: "🔄", description: "Switch to an NFT-supported network" }
  }, [chainId, networks])

  const isNFTNetwork = isSupportedNFTNetwork(chainId);

  const handleSwitchNetwork = async (network: any) => {
    setIsPending(true);
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        toast.error("Wallet not found. Please install MetaMask.");
        return;
      }

      try {
        // Request account access if needed
        await ethereum.request({ method: 'eth_requestAccounts' });
        
        // Switch to the network
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${network.id.toString(16)}` }],
        });
        
        toast.success(`Switching to ${network.name}...`);
      } catch (switchError: any) {
        // This error code means that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${network.id.toString(16)}`,
                  chainName: network.name,
                  nativeCurrency: network.nativeCurrency,
                  rpcUrls: network.rpcUrls,
                  blockExplorerUrls: [network.blockExplorerUrl],
                },
              ],
            });
            toast.success(`${network.name} added to your wallet!`);
          } catch (addError) {
            toast.error(`Could not add ${network.name} to your wallet.`);
            console.error(addError);
          }
        } else {
          toast.error(`Error switching to ${network.name}.`);
          console.error(switchError);
        }
      }
    } catch (error) {
      console.error("Network switch error:", error);
      toast.error("Failed to switch network. Please try manually in your wallet.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`h-9 border-orange-500/30 ${isNFTNetwork ? 'bg-green-800' : 'bg-gray-800'} hover:bg-gray-700 text-orange-400 hover:text-orange-300 rounded-full`}
        >
          <span className="mr-1">{currentNetwork.icon}</span>
          {isNFTNetwork ? currentNetwork.name : "Switch Network"}
          <ChevronDownIcon className="ml-2 h-4 w-4 text-orange-400/70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 border-orange-500/30 bg-gray-900 text-orange-300">
        <div className="p-2 text-xs text-orange-400/70 border-b border-orange-500/20">
          Select NFT Network
        </div>
        {networks.map((network) => (
          <DropdownMenuItem
            key={network.id}
            className={`flex items-start gap-2 p-3 cursor-pointer ${
              network.id === chainId 
                ? 'bg-orange-950/30' 
                : 'hover:bg-gray-800'
            }`}
            disabled={isPending || network.id === chainId}
            onClick={() => handleSwitchNetwork(network)}
          >
            <span className="text-lg mt-0.5">{network.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">{network.name}</div>
                {network.id === chainId && (
                  <CheckIcon className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="text-xs mt-1 text-orange-400/70">{network.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 