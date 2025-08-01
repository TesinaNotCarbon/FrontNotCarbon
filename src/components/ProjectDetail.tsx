import { useParams, Link } from "react-router-dom";
import { useAccount, useReadContract } from 'wagmi'
import { projectAbi } from '../../contracts'

export function ProjectDetail() {
    const { contractAddress } = useParams<{ contractAddress: string }>()
    const { address } = useAccount()

    const { data: projectName } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: projectAbi,
        functionName: 'projectName',
        query: {
            enabled: !!contractAddress && !!address,
        }
    })

    const { data: projectDescription } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: projectAbi,
        functionName: 'projectDescription',
        query: {
            enabled: !!contractAddress && !!address,
        }
    })

    const { data: projectCreator } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: projectAbi,
        functionName: 'getCreator',
        query: {
            enabled: !!contractAddress && !!address,
        }
    })

    const { data: projectStatus } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: projectAbi,
        functionName: 'currentState',
        query: {
            enabled: !!contractAddress && !!address,
        }
    })
    console.log('Project Status:', projectStatus)

    const { data: availableTokens } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: projectAbi,
        functionName: 'getAvailableTokens',
        query: {
            enabled: !!contractAddress && !!address,
        }
    })
    console.log('Available Tokens:', availableTokens?.toString())
    if (!contractAddress) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
                    <p className="text-red-600">Invalid project address</p>
                    <Link to="/" className="text-red-700 hover:text-red-900 underline mt-4 inline-block">
                        ← Back to Projects
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header con navegación */}
            <div className="mb-8">
                <Link 
                    to="/" 
                    className="inline-flex items-center text-green-600 hover:text-green-800 mb-4 transition-colors"
                >
                    <span className="mr-2">←</span>
                    Back to Projects
                </Link>
                
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <span className="mr-3">🌲</span>
                    {projectName || 'Loading...'}
                </h1>
            </div>

            {/* Información principal del proyecto */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                    <h2 className="text-xl font-semibold mb-2">Project Details</h2>
                    <p className="text-green-100">Carbon Credit Project Information</p>
                </div>

                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Información básica */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Project Name
                                </label>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-800 font-medium">
                                        {projectName || 'Loading...'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Contract Address
                                </label>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-800 font-mono text-sm break-all">
                                        {contractAddress}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Project Creator
                                </label>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-800 font-mono text-sm">
                                        {projectCreator ? 
                                            `${(projectCreator as string).slice(0, 12)}...${(projectCreator as string).slice(-10)}` : 
                                            'Loading...'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Descripción del proyecto */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Project Description
                            </label>
                            <div className="bg-gray-50 p-4 rounded-lg h-full min-h-[200px]">
                                <p className="text-gray-800 leading-relaxed">
                                    {projectDescription || 'Loading project description...'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Estadísticas del proyecto */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <div className="text-2xl mb-2">🌱</div>
                            <h3 className="font-semibold text-green-800">Status</h3>
                            <p className="text-green-600">{projectStatus == 0 ? 'Inactive' : 'Active'}</p>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <div className="text-2xl mb-2">📊</div>
                            <h3 className="font-semibold text-blue-800">Carbon Credits</h3>
                            <p className="text-blue-600">Available: {availableTokens?.toString()}</p>
                        </div>
                        
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                            <div className="text-2xl mb-2">🔗</div>
                            <h3 className="font-semibold text-purple-800">Blockchain</h3>
                            <p className="text-purple-600">Sepolia</p>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="mt-8 flex flex-wrap gap-4">
                        <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2">
                            <span>💰</span>
                            <span>Buy Carbon Credits</span>
                        </button>
                        
                        <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2">
                            <span>📈</span>
                            <span>View Analytics</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectDetail
