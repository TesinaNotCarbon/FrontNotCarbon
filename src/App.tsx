import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'
import { useConnect } from 'wagmi'
import { metaMask } from 'wagmi/connectors'


export function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  return (
    <div>
      {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0)
  const { connect } = useConnect()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  return (
    <>
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
      {address === undefined ? (<button onClick={() => connect({ connector: metaMask() })}>
        Connect
      </button>) : (<button onClick={() => disconnect()}>Disconnect</button>)}


    </>
  )
}

export default App
