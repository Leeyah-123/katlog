'use client';

import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// Set up Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;

const reownMetadata = {
  name: 'Katlog',
  description: 'Monitor account actions on Solana.',
  url: process.env.NEXT_PUBLIC_APP_URL!,
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

// Create modal
createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaDevnet, solanaTestnet],
  metadata: reownMetadata,
  themeVariables: {
    '--w3m-accent': '#512da8',
    '--w3m-border-radius-master': '0.6px',
  },
  projectId,
  features: {
    email: false,
    socials: [],
    analytics: true,
    history: false,
    onramp: false,
    receive: false,
    send: false,
  },
});

export default function ConnectButton() {
  return <appkit-button />;
}
