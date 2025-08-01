

export const projectManagerAbi = {
  address: import.meta.env.VITE_PROJECT_MANAGER_CONTRACT_ADDRESS as `0x${string}`,
  abi: [
    {
      type: 'function',
      name: 'getAllProjects',
      stateMutability: 'view',
      inputs: [],
      outputs: [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
    },
    {
      inputs: [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "_carbonCreditTokenAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_totalTokens",
          "type": "uint256"
        }
      ],
      name: "registerProject",
      outputs: [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    
    
  ],
} as const

export const projectAbi = [
  {
    type: 'function',
    name: 'projectName',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
  },
  {
    type: 'function',
    name: 'getCreator',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address', name: '' }],
  },
   {
    type: 'function',
    name: 'projectDescription',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
  },
  {
      inputs: [],
      name: "currentState",
      outputs: [
        {
          "internalType": "enum Project.ProjectState",
          "name": "",
          "type": "uint8"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "getAvailableTokens",
      outputs: [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    }
] as const