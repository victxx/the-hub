import { createPublicClient, createWalletClient, http, parseEther, encodeFunctionData } from 'viem';
import { custom } from 'viem';
import { defineChain } from 'viem';

// Define Base Camp testnet chain
const baseCamp = defineChain({
  id: 123420001114,
  name: 'Base Camp',
  nativeCurrency: {
    name: 'CAMP',
    symbol: 'CAMP',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.basecamp.t.raas.gelato.cloud', 'https://rpc-campnetwork.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://basecamp.cloud.blockscout.com',
    },
  },
  testnet: true,
});

const CONTRACT_ADDRESS = '0x3Bf712949b4C5376F8b3fcd004BEf974F0702D62';

// ABI for CartuchoRegistry
const CONTRACT_ABI = [
  // Read functions
  "function nextCartuchoId() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  
  // Write functions
  "function registerCartucho(address to, string memory cidSuffix, bool allowCommercialUse, bool allowDerivativeWorks, uint256 expiry) external",
  
  // Events
  "event CartuchoRegistered(uint256 indexed tokenId, address indexed owner, string cidSuffix, CartuchoTerms terms)"
] as const;

interface CartuchoTerms {
  allowCommercialUse: boolean;
  allowDerivativeWorks: boolean;
  expiry: number;
}

export async function getPublicClient() {
  return createPublicClient({
    chain: baseCamp,
    transport: http()
  });
}

export async function getWalletClient() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found');
  }

  try {
    // Solicitar acceso a la cuenta explícitamente antes de crear el cliente
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect your wallet.');
    }
    
    const walletClient = createWalletClient({
      chain: baseCamp,
      transport: custom(window.ethereum)
    });
    
    return walletClient;
  } catch (error) {
    console.error("Error creating wallet client:", error);
    throw new Error('Failed to connect to wallet. Please refresh and try again.');
  }
}

export async function getTotalCartuchos() {
  try {
    const publicClient = await getPublicClient();
    
    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'nextCartuchoId'
    });
    
    // Asegurarnos de que el resultado es un BigInt y convertirlo a Number
    if (typeof result === 'bigint') {
      return Number(result);
    }
    
    // Si no es BigInt, devolver 0 como valor seguro por defecto
    console.warn('nextCartuchoId did not return a bigint, defaulting to 0');
    return 0;
  } catch (error) {
    console.error("Error getting total cartuchos:", error);
    return 0; // Valor seguro por defecto
  }
}

export async function getOwnerOf(tokenId: number) {
  const publicClient = await getPublicClient();
  
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'ownerOf',
    args: [BigInt(tokenId)]
  });
}

export async function getTokenURI(tokenId: number) {
  const publicClient = await getPublicClient();
  
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)]
  });
}

interface CartuchoInfo {
  id: number;
  uri: string;
}

export async function getUserCartuchos(userAddress: string): Promise<CartuchoInfo[]> {
  try {
    if (!userAddress) {
      console.error("No user address provided");
      return [];
    }
    
    const total = await getTotalCartuchos();
    const cartuchos: CartuchoInfo[] = [];
    const publicClient = await getPublicClient();

    // Si no hay cartuchos, devolver array vacío
    if (total === 0) {
      return [];
    }

    for (let id = 0; id < total; id++) {
      try {
        const owner = await getOwnerOf(id);
        
        // Comprobar que owner es una string antes de usar toLowerCase
        if (typeof owner === 'string' && owner.toLowerCase() === userAddress.toLowerCase()) {
          const uri = await getTokenURI(id);
          
          if (typeof uri === 'string') {
            cartuchos.push({
              id,
              uri
            });
          }
        }
      } catch (error) {
        // Skip errors (token might not exist)
        console.error(`Error fetching cartucho ${id}:`, error);
      }
    }

    return cartuchos;
  } catch (error) {
    console.error("Error getting user cartuchos:", error);
    return []; // Devolver array vacío en caso de error
  }
}

export async function registerCartucho(
  to: string,
  cidSuffix: string,
  allowCommercialUse: boolean,
  allowDerivativeWorks: boolean,
  expiry: number,
  price?: string // Price in CAMP
) {
  try {
    // Primero, verificar que estamos conectados a la red correcta
    if (typeof window !== 'undefined' && window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // Convertir chainId de hex a decimal
      const currentChainId = parseInt(chainId, 16);
      
      // Verificar que es Base Camp
      if (currentChainId !== baseCamp.id) {
        throw new Error(`Please switch to Base Camp network. Current chain ID: ${currentChainId}`);
      }
    }
    
    // Obtener la cuenta explícitamente
    if (!window.ethereum) {
      throw new Error('Ethereum provider not found');
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No account connected. Please connect your wallet.');
    }
    
    // Crear un publicClient para codificar la llamada a la función
    const publicClient = await getPublicClient();
    
    // Codificar la llamada a la función "registerCartucho"
    const data = encodeFunctionData({
      abi: CONTRACT_ABI,
      functionName: 'registerCartucho',
      args: [to, cidSuffix, allowCommercialUse, allowDerivativeWorks, BigInt(expiry)]
    });
    
    // Usar directamente window.ethereum para enviar la transacción
    const transactionParameters = {
      from: accounts[0],
      to: CONTRACT_ADDRESS,
      data: data,
      value: price ? '0x' + Math.floor(parseFloat(price) * 10**18).toString(16) : '0x0',
    };
    
    console.log('Sending transaction with parameters:', transactionParameters);
    
    // Enviar la transacción directamente
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    
    console.log('Transaction sent with hash:', txHash);
    
    return txHash;
  } catch (error: any) {
    console.error('Error sending transaction:', error);
    
    // Provide more specific error messages for common issues
    if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient CAMP tokens. Please make sure you have enough balance.');
    } else if (error.message?.includes('user rejected')) {
      throw new Error('Transaction was rejected by the user.');
    } else if (error.message?.includes('account')) {
      throw new Error('No account connected. Please connect your wallet and try again.');
    } else {
      throw error;
    }
  }
} 