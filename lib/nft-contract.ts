import { createPublicClient, createWalletClient, http, encodeFunctionData } from 'viem';
import { defineChain } from 'viem';
import { custom } from 'viem';

// Define Scroll Sepolia testnet chain
export const scrollSepolia = defineChain({
  id: 534351,
  name: 'Scroll Sepolia',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.scroll.io'],
    },
    public: {
      http: [
        'https://sepolia-rpc.scroll.io',
        'https://rpc.ankr.com/scroll_sepolia_testnet',
        'https://scroll-sepolia.chainstacklabs.com',
        'https://scroll-testnet-public.unifra.io'
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Scrollscan',
      url: 'https://sepolia.scrollscan.com',
    },
  },
  testnet: true,
});

// Define Arbitrum Sepolia testnet chain
export const arbitrumSepolia = defineChain({
  id: 421614,
  name: 'Arbitrum Sepolia',
  nativeCurrency: {
    name: 'Arbitrum Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rollup.arbitrum.io/rpc'],
    },
    public: {
      http: [
        'https://sepolia-rollup.arbitrum.io/rpc',
        'https://arbitrum-sepolia.drpc.org'
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arbiscan',
      url: 'https://sepolia.arbiscan.io',
    },
    arbitrumExplorer: {
      name: 'Arbitrum Explorer',
      url: 'https://sepolia-explorer.arbitrum.io',
    },
    blockscout: {
      name: 'Blockscout',
      url: 'https://arbitrum-sepolia.blockscout.com',
    }
  },
});

// Define Mantle Testnet chain
export const mantleTestnet = defineChain({
  id: 5003,
  name: 'Mantle Sepolia',
  nativeCurrency: {
    name: 'Mantle',
    symbol: 'MNT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
    public: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    }
  },
  blockExplorers: {
    default: {
      name: 'Mantle Explorer',
      url: 'https://sepolia.mantlescan.xyz',
    },
  },
});

// Array of supported networks for NFT minting
export const supportedNFTNetworks = [
  scrollSepolia,
  arbitrumSepolia,
  mantleTestnet
];

// GameOutcomeNFT contract addresses on different networks
const contractAddresses: Record<number, `0x${string}`> = {
  [scrollSepolia.id]: '0x503E011a8Fb7f4D3CF31cA777C8a838504e7f18E' as `0x${string}`,
  [arbitrumSepolia.id]: '0x503E011a8Fb7f4D3CF31cA777C8a838504e7f18E' as `0x${string}`, // Update this with the actual contract address
  [mantleTestnet.id]: '0x503E011a8Fb7f4D3CF31cA777C8a838504e7f18E' as `0x${string}`, // Update this with the actual contract address
};

// Contract ABI for the NFT contract
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "name": "mintVictory",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "name": "mintDefeat",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Function to check if a chainId is for a network that supports NFT minting
export function isSupportedNFTNetwork(chainId: number): boolean {
  return supportedNFTNetworks.some(network => network.id === chainId);
}

// Get the explorer URL for a given chainId
export function getExplorerUrl(chainId: number): string {
  const network = supportedNFTNetworks.find(n => n.id === chainId);
  return network?.blockExplorers?.default?.url || 'https://sepolia.scrollscan.com';
}

// Function to mint a Victory NFT
export async function mintVictoryNFT(to: string, tokenURI: string): Promise<string> {
  try {
    // Get Ethereum from window object
    const ethereum = (window as any).ethereum;
    if (!ethereum) throw new Error("No Ethereum wallet detected. Please install MetaMask.");

    // Get the current chain ID
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    const currentChainId = parseInt(chainId, 16);

    // Check if the current network is supported
    if (!isSupportedNFTNetwork(currentChainId)) {
      throw new Error("Please switch to a supported network (Scroll Sepolia, Arbitrum Sepolia, or Mantle Sepolia)");
    }

    // Get the contract address for the current network
    const contractAddress = contractAddresses[currentChainId];
    if (!contractAddress) {
      throw new Error("Contract not deployed on this network");
    }

    // Get user's accounts
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please connect your wallet.");
    }

    // Encode the function call
    const functionData = encodeFunctionData({
      abi: contractABI,
      functionName: 'mintVictory',
      args: [to, tokenURI],
    });

    // Send the transaction
    const txHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: accounts[0],
        to: contractAddress,
        data: functionData,
      }],
    });

    return txHash;
  } catch (error) {
    console.error("Error in mintVictoryNFT:", error);
    throw error;
  }
}

// Function to mint a Defeat NFT
export async function mintDefeatNFT(to: string, tokenURI: string): Promise<string> {
  try {
    // Get Ethereum from window object
    const ethereum = (window as any).ethereum;
    if (!ethereum) throw new Error("No Ethereum wallet detected. Please install MetaMask.");

    // Get the current chain ID
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    const currentChainId = parseInt(chainId, 16);

    // Check if the current network is supported
    if (!isSupportedNFTNetwork(currentChainId)) {
      throw new Error("Please switch to a supported network (Scroll Sepolia, Arbitrum Sepolia, or Mantle Sepolia)");
    }

    // Get the contract address for the current network
    const contractAddress = contractAddresses[currentChainId];
    if (!contractAddress) {
      throw new Error("Contract not deployed on this network");
    }

    // Get user's accounts
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please connect your wallet.");
    }

    // Encode the function call
    const functionData = encodeFunctionData({
      abi: contractABI,
      functionName: 'mintDefeat',
      args: [to, tokenURI],
    });

    // Send the transaction
    const txHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: accounts[0],
        to: contractAddress,
        data: functionData,
      }],
    });

    return txHash;
  } catch (error) {
    console.error("Error in mintDefeatNFT:", error);
    throw error;
  }
}

export async function getScrollPublicClient() {
  return createPublicClient({
    chain: scrollSepolia,
    transport: http()
  });
}

export async function getScrollWalletClient() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found');
  }

  try {
    // Request account access explicitly before creating the client
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect your wallet.');
    }
    
    const walletClient = createWalletClient({
      chain: scrollSepolia,
      transport: custom(window.ethereum)
    });
    
    return walletClient;
  } catch (error) {
    console.error("Error creating wallet client:", error);
    throw new Error('Failed to connect to wallet. Please refresh and try again.');
  }
}

export async function getTotalNFTs() {
  try {
    const publicClient = await getScrollPublicClient();
    
    const result = await publicClient.readContract({
      address: contractAddresses[scrollSepolia.id],
      abi: contractABI,
      functionName: 'tokenCounter'
    });
    
    // Make sure the result is a BigInt and convert it to Number
    if (typeof result === 'bigint') {
      return Number(result);
    }
    
    console.warn('tokenCounter did not return a bigint, defaulting to 0');
    return 0;
  } catch (error) {
    console.error("Error getting total NFTs:", error);
    return 0;
  }
}

export async function getNftOwner(tokenId: number) {
  const publicClient = await getScrollPublicClient();
  
  return publicClient.readContract({
    address: contractAddresses[scrollSepolia.id],
    abi: contractABI,
    functionName: 'ownerOf',
    args: [BigInt(tokenId)]
  });
}

export async function getNftTokenURI(tokenId: number) {
  const publicClient = await getScrollPublicClient();
  
  return publicClient.readContract({
    address: contractAddresses[scrollSepolia.id],
    abi: contractABI,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)]
  });
} 