"use client";

import * as React from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { scrollSepolia, arbitrumSepolia, mantleTestnet } from '@/lib/nft-contract';

// Define Base Camp testnet chain
const baseCamp = {
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
};

// Project ID from WalletConnect - required for WalletConnect v2
const projectId = '2ca78ce11da4d0ae7aeaec9f21d0345c';

// Create config with getDefaultConfig
const config = getDefaultConfig({
  appName: 'The Hub',
  projectId: projectId,
  chains: [baseCamp, scrollSepolia, arbitrumSepolia, mantleTestnet],
  transports: {
    [baseCamp.id]: {
      http: ['https://rpc.basecamp.t.raas.gelato.cloud', 'https://rpc-campnetwork.xyz'],
    },
    [scrollSepolia.id]: {
      http: ['https://sepolia-rpc.scroll.io'],
    },
    [arbitrumSepolia.id]: {
      http: ['https://sepolia-rollup.arbitrum.io/rpc'],
    },
    [mantleTestnet.id]: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
  },
});

// Create query client
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 