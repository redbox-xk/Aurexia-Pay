import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { mainnet, polygon, bsc, avalanche, arbitrum, optimism } from 'wagmi/chains';
import { App } from './App';
import '../styles/globals.css';

const { chains, publicClient } = configureChains(
  [mainnet, polygon, bsc, avalanche, arbitrum, optimism],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
});

const queryClient = new QueryClient();

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiConfig>
  </React.StrictMode>
);
