/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROJECT_MANAGER_CONTRACT_ADDRESS: string
  readonly VITE_WEB3_INFURA_PROJECT_ID: string
  readonly VITE_CARBON_CREDIT_CONTRACT_ADDRESS: string
  readonly VITE_ROLE_MANAGER_CONTRACT_ADDRESS: string
  readonly VITE_COMPANY_MANAGER_CONTRACT_ADDRESS: string
  readonly VITE_CARBON_CREDIT_MARKET_CONTRACT_ADDRESS: string
  readonly VITE_PINATA_API_URL?: string
  readonly VITE_PINATA_JWT?: string
  readonly VITE_PINATA_API_KEY?: string
  readonly VITE_PINATA_API_SECRET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}