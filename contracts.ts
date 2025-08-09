

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
    {
      inputs: [
        {
          "internalType": "address",
          "name": "_projectAddress",
          "type": "address"
        }
      ],
      name: "isProjectRegistered",
      outputs: [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          "internalType": "address",
          "name": "_projectAddress",
          "type": "address"
        },
        {
          "internalType": "enum Project.ProjectState",
          "name": "_newState",
          "type": "uint8"
        }
      ],
      name: "updateProjectStatus",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    }
    
    
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
    },
    {
      inputs: [],
      name: "pricePerToken",
      outputs: [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "totalTokens",
      outputs: [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      name: "buyCarbonCredits",
      outputs: [],
      stateMutability: "payable",
      type: "function"
    },
    {
      inputs: [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      name: "withdrawETH",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "getBalance",
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

export const roleManagerAbi = {
  address: import.meta.env.VITE_ROLE_MANAGER_CONTRACT_ADDRESS as `0x${string}`,
  abi: [
    {
      inputs: [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      name: "isStaffOrAdmin",
      outputs: [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "admin",
      outputs: [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          "internalType": "address",
          "name": "_staff",
          "type": "address"
        }
      ],
      name: "addStaff",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          "internalType": "address",
          "name": "_staff",
          "type": "address"
        }
      ],
      name: "removeStaff",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
  ],
} as const

export const companyManagerAbi = {
  address: import.meta.env.VITE_COMPANY_MANAGER_CONTRACT_ADDRESS as `0x${string}`,
  abi: [
    {
      inputs: [],
      name: "getAllCompanies",
      outputs: [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_monthlyEmissions",
          "type": "uint256"
        }
      ],
      name: "createCompany",
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
    {
      inputs: [
        {
          "internalType": "address payable",
          "name": "_companyAddress",
          "type": "address"
        }
      ],
      name: "approveCompany",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      name: "registeredCompanies",
      outputs: [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    }
  ],
} as const

export const companyAbi = [
  {
      inputs: [],
      name: "monthlyEmissions",
      outputs: [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "isApproved",
      outputs: [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "carbonCredits",
      outputs: [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          "internalType": "address payable",
          "name": "projectAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      name: "buyFromProject",
      outputs: [],
      stateMutability: "payable",
      type: "function"
    },
    {
      inputs: [
        {
          "internalType": "address",
          "name": "market",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      name: "buyFromMarket",
      outputs: [],
      stateMutability: "payable",
      type: "function"
    }
] as const
