import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { projectManagerAbi, projectAbi } from '../../contracts'
import { Link } from "react-router-dom";
import LoadingOverlay from "./LoadingOverlay";
import { Trees, TreePine } from "lucide-react";
export function Projects() {
    const { address } = useAccount()


    const { data: projects } = useReadContract({
        ...projectManagerAbi,
        functionName: 'getAllProjects',
        query: {
            enabled: !!address,
        }
    })

    const { data: projectNames, isLoading: namesLoading } = useReadContracts({
        contracts: projects?.map((projectAddress) => ({
            address: projectAddress as `0x${string}`,
            abi: projectAbi,
            functionName: 'projectName',
        })) || [],
        query: {
            enabled: !!projects && projects.length > 0,
        }
    })

    const { data: projectCreators, isLoading: creatorsLoading } = useReadContracts({
        contracts: projects?.map((projectAddress) => ({
            address: projectAddress as `0x${string}`,
            abi: projectAbi,
            functionName: 'getCreator',
        })) || [],
        query: {
            enabled: !!projects && projects.length > 0,
        }
    })

    const { data: projectDescriptions, isLoading: descriptionsLoading } = useReadContracts({
        contracts: projects?.map((projectAddress) => ({
            address: projectAddress as `0x${string}`,
            abi: projectAbi,
            functionName: 'projectDescription',
        })) || [],
        query: {
            enabled: !!projects && projects.length > 0,
        }
    })
    const isLoading = namesLoading || descriptionsLoading || creatorsLoading
    return (
        <div className="">
            <LoadingOverlay isLoading={isLoading} />
            {address && (
                <div className="bg-gray-100 p-6 mb-8 w-full h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Trees className="mr-2 text-green-600" size={32} />
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
                    {projects && (<>
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
                                        className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer block hover:border-green-300"
                                    >
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2">
                                                <TreePine className="text-green-600" size={24} />
                                                <h4 className="font-bold text-lg text-gray-800">
                                                    {projectNames?.[index]?.result || 'Loading...'}
                                                </h4>
                                            </div>

                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center">
                                                <span className="font-bold text-md text-black mr-2">Address:</span>
                                                <span className="text-gray-800 font-mono break-all">
                                                    {`${projectAddress.slice(0, 8)}...${projectAddress.slice(-6)}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-bold text-md text-black mr-2">Description:</span>
                                                <span className="text-gray-800 line-clamp-2">
                                                    {projectDescriptions?.[index]?.result || 'Loading...'}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-bold text-md text-black mr-2">Creator:</span>
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
                    </>)}
                </div>
            )}
            {!address && (
                <div className="text-center pt-10">
                    <h3 className="text-2xl font-bold mb-4">Connect Your Wallet</h3>
                    <p className="text-gray-600 mb-6">To view and register carbon credit projects, please connect your wallet.</p>
                </div>
            )}
        </div>
    );
};

export default Projects;