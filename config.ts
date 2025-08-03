import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

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