import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { companyManagerAbi, companyAbi } from '../../contracts';
import { Link } from "react-router-dom";
import LoadingOverlay from "./LoadingOverlay";
import { Building2, Building } from "lucide-react";

export function Companies() {
    const { address } = useAccount();

    const { data: companies } = useReadContract({
        ...companyManagerAbi,
        functionName: 'getAllCompanies',
        query: {
            enabled: !!address,
        }
    });

    const { data: companyNames, isLoading: namesLoading } = useReadContracts({
        contracts: companies?.map((companyAddress) => ({
            address: companyAddress as `0x${string}`,
            abi: companyAbi,
            functionName: 'name',
        })) || [],
        query: {
            enabled: !!companies && companies.length > 0,
        }
    });

    const { data: companyOwners, isLoading: ownersLoading } = useReadContracts({
        contracts: companies?.map((companyAddress) => ({
            address: companyAddress as `0x${string}`,
            abi: companyAbi,
            functionName: 'owner',
        })) || [],
        query: {
            enabled: !!companies && companies.length > 0,
        }
    });

    const { data: companyEmissions, isLoading: emissionsLoading } = useReadContracts({
        contracts: companies?.map((companyAddress) => ({
            address: companyAddress as `0x${string}`,
            abi: companyAbi,
            functionName: 'monthlyEmissions',
        })) || [],
        query: {
            enabled: !!companies && companies.length > 0,
        }
    });

    const isLoading = namesLoading || ownersLoading || emissionsLoading;

    return (
        <div className="">
            <LoadingOverlay isLoading={isLoading} />
            {address && (
                <div className="bg-gray-100 p-6 mb-8 w-full h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Building2 className="mr-2 text-green-600" size={32} />
                            Registered Companies
                        </h3>
                        <Link
                            to="/register-company"
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
                        >
                            <Building className="mr-2" size={24} />
                            <span>Register Company</span>
                        </Link>
                    </div>
                    {companies && (<>
                        {companies.length === 0 ? (
                            <div className="text-center py-8">
                                <Building className="mx-auto mb-4 text-gray-400" size={64} />
                                <p className="text-gray-500 text-lg">No companies found. Be the first to register a company!</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {companies.map((companyAddress, index) => (
                                    <Link
                                        key={companyAddress}
                                        to={`/company/${companyAddress}`}
                                        className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer block hover:border-green-300"
                                    >
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2">
                                                <Building className="text-green-600" size={24} />
                                                <h4 className="font-bold text-lg text-gray-800">
                                                    {companyNames?.[index]?.result || 'Loading...'}
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center">
                                                <span className="font-bold text-md text-black mr-2">Address:</span>
                                                <span className="text-gray-800 font-mono break-all">
                                                    {`${companyAddress.slice(0, 8)}...${companyAddress.slice(-6)}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-bold text-md text-black mr-2">Owner:</span>
                                                <span className="text-gray-800 font-mono text-xs">
                                                    {companyOwners?.[index]?.result ?
                                                        `${(companyOwners[index].result as string).slice(0, 8)}...${(companyOwners[index].result as string).slice(-6)}` :
                                                        'Loading...'
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-bold text-md text-black mr-2">Monthly Emissions:</span>
                                                <span className="text-gray-800">
                                                    {companyEmissions?.[index]?.result || 'Loading...'}
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
                    <p className="text-gray-600 mb-6">To view and register companies, please connect your wallet.</p>
                </div>
            )}
        </div>
    );
}

export default Companies;