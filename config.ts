import { http, createConfig } from 'wagmi'
import { base, mainnet, sepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WEB3_INFURA_PROJECT_ID

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask({
      infuraAPIKey: import.meta.env.VITE_WEB3_INFURA_PROJECT_ID,
    }),
  ],
  transports: {
    [sepolia.id]: http()  },
})