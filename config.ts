import { http, createConfig } from 'wagmi'
import { base, mainnet, sepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

const projectId = 'e18dcc77adaed3ab5f7d789cb559588a'

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
    metaMask({
      infuraAPIKey: "2dd3ec556a47427bb6f47095f76f7702",
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})