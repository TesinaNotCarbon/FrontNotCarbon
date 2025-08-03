import { useConnect, useAccount, useDisconnect, useEnsName } from 'wagmi'
import { metaMask } from 'wagmi/connectors'
import { Link } from 'react-router-dom'
import { Trees, Building2, Plug, Wallet } from 'lucide-react';
export function Navbar() {
  const { connect } = useConnect()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })

  return (
    <nav className="relative w-full bg-gradient-to-r from-green-600 to-green-800 shadow-lg border-b border-green-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-2xl">🌱</span>
              </div>
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">Not Carbon</h1>
              <p className="text-xs text-green-100 hidden sm:block">Carbon Credit Management Platform</p>
            </div>
          </div>

          {/* Navegación central */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                to="/"
                className="flex items-center gap-2 text-green-100 hover:text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <Trees/> Projects
              </Link>
              <Link
                to="/companies"
                className="flex items-center gap-2 text-green-100 hover:text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <Building2/> Companies
              </Link>
            </div>
          </div>

          {/* Wallet connection */}
          <div className="flex items-center space-x-4">
            {address && (
              <div className="hidden sm:flex items-center space-x-2 bg-green-700 bg-opacity-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-green-100 text-sm font-medium">
                  {ensName ? ensName : `${address.slice(0, 6)}...${address.slice(-4)}`}
                </span>
              </div>
            )}
            
            {address === undefined ? (
              <button
                onClick={() => connect({ connector: metaMask() })}
                className="bg-white text-green-700 hover:bg-green-50 px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
              >
                <Wallet className="text-green-700" size={16} />
                <span>Connect Wallet</span>
              </button>
            ) : (
              <button
                onClick={() => disconnect()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <Plug className="text-white" size={16} />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}