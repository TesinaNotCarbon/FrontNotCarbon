/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROJECT_MANAGER_CONTRACT_ADDRESS: string
  readonly VITE_WEB3_INFURA_PROJECT_ID: string
  readonly VITE_CARBON_CREDIT_CONTRACT_ADDRESS: string
  readonly VITE_ROLE_MANAGER_CONTRACT_ADDRESS: string
  readonly VITE_COMPANY_MANAGER_CONTRACT_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}