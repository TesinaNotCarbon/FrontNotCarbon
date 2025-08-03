import {useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { companyAbi, companyManagerAbi, roleManagerAbi } from '../../contracts';
import LoadingOverlay from "./LoadingOverlay";
import { toast } from "react-toastify";
import { Building, FileText, Radiation, ArrowLeft, Leaf } from "lucide-react";

export function CompanyDetail() {
    const { companyAddress } = useParams<{ companyAddress: string }>();
    const { address } = useAccount()
    const { data: hash, isPending, writeContract } = useWriteContract();

    const { data: companyName, isLoading: nameLoading } = useReadContract({
        address: companyAddress as `0x${string}`,
        abi: companyAbi,
        functionName: 'name',
        query: {
            enabled: !!companyAddress,
        }
    });

    const { data: companyOwner, isLoading: ownerLoading } = useReadContract({
        address: companyAddress as `0x${string}`,
        abi: companyAbi,
        functionName: 'owner',
        query: {
            enabled: !!companyAddress,
        }
    });

    const { data: monthlyEmissions, isLoading: emissionsLoading } = useReadContract({
        address: companyAddress as `0x${string}`,
        abi: companyAbi,
        functionName: 'monthlyEmissions',
        query: {
            enabled: !!companyAddress,
        }
    });

    const { data: isApproved, isLoading: approvalLoading } = useReadContract({
        address: companyAddress as `0x${string}`,
        abi: companyAbi,
        functionName: 'isApproved',
        query: {
            enabled: !!companyAddress,
        }
    });

    const { data: isStaffOrAdmin, isLoading: isStaffLoading } = useReadContract({
        ...roleManagerAbi,
        functionName: 'isStaffOrAdmin',
        args: [address as `0x${string}`],
        query: {
            enabled: !!companyAddress && !!address,
        }
    })

    const { data: isRegistered, isLoading: isRegisteredLoading } = useReadContract({
        ...companyManagerAbi,
        functionName: 'registeredCompanies',
        args: [companyAddress as `0x${string}`],
        query: {
            enabled: !!companyAddress,
        }
    });

    const { data: carbonCredits, isLoading: carbonCreditsLoading } = useReadContract({
        address: companyAddress as `0x${string}`,
        abi: companyAbi,
        functionName: 'carbonCredits',
        query: {
            enabled: !!companyAddress,
        }
    });

    const { isLoading: isWaitingForReceipt, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const handleApproveCompany = async () => {
        if (!address) {
            toast.error('Company address is not available');
            return;
        }
        try {
            const result = writeContract({
                ...companyManagerAbi,
                functionName: 'approveCompany',
                args: [companyAddress as `0x${string}`],
            });
            console.log('Transaction initiated:', result);
            toast.info('Transaction submitted, please wait for confirmation...');
        } catch (error) {
            console.error('Error approving company:', error);
            toast.error('Error approving company');
        } finally {
            window.location.reload();
        }
    };

    useEffect(() => {
        if (isReceiptSuccess) {
            toast.success('Transaction successful!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            window.location.reload();
        }
    }, [isReceiptSuccess]);

    const isLoading = nameLoading || ownerLoading || emissionsLoading || approvalLoading || isWaitingForReceipt || isStaffLoading || isRegisteredLoading || isPending || carbonCreditsLoading;

    if (!isLoading && !isRegistered) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="text-center">
                        <div className="text-4xl mb-4">❌</div>
                        <h2 className="text-xl font-bold text-red-800 mb-2">Company Not Found</h2>
                        <p className="text-red-600 mb-4">
                            This company is not registered in our system or the contract address is invalid.
                        </p>
                        <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
                            <p className="text-sm text-red-700">
                                <strong>Contract Address:</strong> {companyAddress}
                            </p>
                        </div>
                        <Link
                            to="/companies"
                            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="mr-2" />
                            Back to Companies
                        </Link>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <>
            <LoadingOverlay isLoading={isLoading} text="Processing..." />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
                        <Building className="text-green-600 mr-3" size={32} />
                        Company Details
                    </h1>

                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white flex items-center justify-between">
                        <h2 className="text-xl font-semibold">{companyName || 'Loading...'}</h2>
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full bg-white ${(isApproved ?? false) ? 'border border-green-300' : 'border border-red-300'}`}>
                            <div className="text-lg">
                                {(isApproved ? '🟢' : '🔴')}
                            </div>
                            <p className={`font-semibold ${(isApproved ? 'text-green-700' : 'text-red-700')}`}>
                                {(isApproved ? 'Approved' : 'Not Approved')}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <FileText className="text-green-600" size={24} />
                            <div>
                                <h3 className="font-semibold text-gray-800">Owner</h3>
                                <p className="text-gray-600 font-mono">
                                    {companyOwner ? companyOwner : 'Loading...'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Radiation className="text-green-600" size={24} />
                            <div>
                                <h3 className="font-semibold text-gray-800">Monthly Emissions</h3>
                                <p className="text-gray-600">
                                    {monthlyEmissions || 'Loading...'} Carbon Units
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Leaf className="text-green-600" size={24} />
                            <div>
                                <h3 className="font-semibold text-gray-800">Bouht Carbon Credits</h3>
                                <p className="text-gray-600">
                                    {carbonCredits?.toString() || 'Loading...'}
                                </p>
                            </div>
                        </div>


                    </div>
                </div>
                {isStaffOrAdmin && (
                    <div className="mt-6 justify-end text-right">
                        <button
                            onClick={() => handleApproveCompany()}
                            disabled={isApproved}
                            className={`${isApproved ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'} text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105`}
                        >
                            {isApproved ? 'Approved' : 'Approve Company'}
                        </button>
                    </div>
                )}
            </div>

        </>
    );
}

export default CompanyDetail;