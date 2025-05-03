"use client";

import * as React from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { http } from 'viem';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// En un proyecto real, este valor debería estar en .env.local
const projectId = "4caf3ff9196e663e8c573e00e20b1d0c";

const config = getDefaultConfig({
  appName: 'The Hub',
  projectId: projectId,
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 