import React from "react";
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { projectManagerAbi, projectAbi } from '../../contracts'
import { Link } from "react-router-dom";
export function Projects() {
    const { address } = useAccount()
    const { data: projects } = useReadContract({
        ...projectManagerAbi,
        functionName: 'getAllProjects',
        query: {
            enabled: !!address,
        }
    })

    const { data: projectNames } = useReadContracts({
        contracts: projects?.map((projectAddress) => ({
            address: projectAddress as `0x${string}`,
            abi: projectAbi,
            functionName: 'projectName',
        })) || [],
        query: {
            enabled: !!projects && projects.length > 0,
        }
    })

    const { data: projectCreators } = useReadContracts({
        contracts: projects?.map((projectAddress) => ({
            address: projectAddress as `0x${string}`,
            abi: projectAbi,
            functionName: 'getCreator',
        })) || [],
        query: {
            enabled: !!projects && projects.length > 0,
        }
    })

    const { data: projectDescriptions } = useReadContracts({
        contracts: projects?.map((projectAddress) => ({
            address: projectAddress as `0x${string}`,
            abi: projectAbi,
            functionName: 'projectDescription',
        })) || [],
        query: {
            enabled: !!projects && projects.length > 0,
        }
    })
    return (
        <div className="">
            {projects && (
                <div className="bg-gray-100 p-6 mb-8 w-full h-full">
                    <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="mr-2">🌿</span>
                        Carbon Credit Projects
                    </h3>
                    <Link
                to="/register"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
              >
                <span>🌱</span>
                <span>Register Project</span>
              </Link>
              </div>
                    
                    {projects.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-4">🌱</div>
                            <p className="text-gray-500 text-lg">No projects found. Be the first to register a carbon credit project!</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {projects.map((projectAddress, index) => (
                                <Link 
                                    key={projectAddress} 
                                    to={`/project/${projectAddress}`}
                                    className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-5 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer block"
                                >
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-2xl">🌲</span>
                                        </div>
                                        <h4 className="font-bold text-lg text-gray-800 mb-2">
                                            {projectNames?.[index]?.result || 'Loading...'}
                                        </h4>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start">
                                            <span className="font-medium text-gray-600 w-20">Address:</span>
                                            <span className="text-gray-800 font-mono text-xs break-all">
                                                {`${projectAddress.slice(0, 8)}...${projectAddress.slice(-6)}`}
                                            </span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="font-medium text-gray-600 w-20">Description:</span>
                                            <span className="text-gray-800 line-clamp-2">
                                                {projectDescriptions?.[index]?.result || 'Loading...'}
                                            </span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="font-medium text-gray-600 w-20">Creator:</span>
                                            <span className="text-gray-800 font-mono text-xs">
                                                {projectCreators?.[index]?.result ?
                                                    `${(projectCreators[index].result as string).slice(0, 8)}...${(projectCreators[index].result as string).slice(-6)}` :
                                                    'Loading...'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Projects;