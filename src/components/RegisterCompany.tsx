import React, { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { companyManagerAbi } from '../../contracts';
import { toast } from "react-toastify";
import LoadingOverlay from './LoadingOverlay';
import { Link } from "react-router-dom";
import { ArrowLeft, Building, Radiation } from "lucide-react";

export function RegisterCompany() {
    const { address } = useAccount();
    const { data: hash, isPending, writeContract } = useWriteContract();
    const [formData, setFormData] = useState({
        name: '',
        monthlyEmissions: ''
    });

    const { isLoading: isWaitingForReceipt, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isReceiptSuccess) {
            toast.success('Company registered successfully!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            // Reset form
            setFormData({
                name: '',
                monthlyEmissions: ''
            });
        }
    }, [isReceiptSuccess]);

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!address) {
            toast.error('Please connect your wallet first');
            return;
        }

        const formDataObj = new FormData(event.currentTarget);
        const name = formDataObj.get('name') as string;
        const monthlyEmissions = formDataObj.get('monthlyEmissions') as string;

        if (!name || !monthlyEmissions) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const result = writeContract({
                ...companyManagerAbi,
                functionName: 'createCompany',
                args: [name, BigInt(monthlyEmissions)],
            });
            console.log('Transaction initiated:', result);
            toast.info('Transaction submitted, please wait for confirmation...');
        } catch (error) {
            console.error('Error registering company:', error);
            toast.error('Error registering company');
        }
    }

    const isLoading = isPending || isWaitingForReceipt;
    return (
        <>
            <LoadingOverlay
                isLoading={isLoading}
                text="Registering Company..."
                showFunFact={true}
            />

            <div className="container mx-auto px-4 py-8">
                {/* Header con navegación */}
                <div className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center text-green-600 hover:text-green-800 mb-4 transition-colors"
                    >
                        <ArrowLeft className="mr-2" />
                        Back to Companies
                    </Link>

                    <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
                        <Building className="text-green-600 mr-3" size={32} />
                        Register New Company
                    </h1>
                </div>

                {/* Form Principal */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                        <h2 className="text-xl font-semibold">Company Registration</h2>
                        <p className="text-green-100 mt-1">Create a new company</p>
                    </div>

                    <div className="p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Company Name Card */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building className="text-green-600" size={24} />
                                        <h3 className="font-semibold text-gray-800">Company Name</h3>
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                        placeholder="e.g., GreenTech Solutions"
                                    />
                                </div>

                                {/* Monthly Emissions Card */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Radiation className="text-green-600" size={24} />
                                        <h3 className="font-semibold text-gray-800">Monthly Emissions</h3>
                                    </div>
                                    <input
                                        type="number"
                                        name="monthlyEmissions"
                                        id="monthlyEmissions"
                                        required
                                        min="1"
                                        value={formData.monthlyEmissions}
                                        onChange={(e) => setFormData({...formData, monthlyEmissions: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                        placeholder="e.g., 500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!address || isPending}
                                    className={`${
                                        !address || isPending 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-lg transform hover:scale-105'
                                    } text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md flex items-center space-x-2`}
                                >
                                    <Building className="mr-2" size={24} />
                                    <span>{isPending ? 'Registering...' : 'Register Company'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Wallet connection notice */}
                {!address && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <span className="text-yellow-600 mr-2">⚠️</span>
                            <p className="text-yellow-800">
                                Please connect your wallet to register a new company.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default RegisterCompany;