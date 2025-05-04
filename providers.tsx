"use client";

import * as React from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { mainnet, base } from 'wagmi/chains';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';

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

// En un proyecto real, este valor debería estar en .env.local
const projectId = "4caf3ff9196e663e8c573e00e20b1d0c";

const { connectors } = getDefaultWallets({
  appName: 'The Hub',
  projectId: projectId,
});

const config = createConfig({
  chains: [baseCamp, base, mainnet],
  transports: {
    [baseCamp.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  connectors,
});

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