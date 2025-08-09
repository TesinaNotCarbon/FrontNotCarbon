import { useParams, Link } from "react-router-dom";
import {
    useAccount, useReadContract, useWriteContract,
    useWaitForTransactionReceipt
} from 'wagmi'
import { projectAbi, projectManagerAbi, roleManagerAbi } from '../../contracts'
import LoadingOverlay from './LoadingOverlay'
import { ArrowLeft, Leaf, TreePine, ShoppingBag, ArrowUp, Wallet, CircleUserRound, FileText, BanknoteArrowDown  } from "lucide-react";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

export function ProjectDetail() {
    const { contractAddress } = useParams<{ contractAddress: string }>()
    const { address } = useAccount()
    const { data: hash, isPending, writeContract } = useWriteContract()
    const [amountToBuy, setAmountToBuy] = useState<number>(1)
    const [amountToWithdraw, setAmountToWithdraw] = useState<number>(1)
    const { data: projectName, isLoading: nameLoading } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: projectAbi,
        functionName: 'projectName',
        query: {
            enabled: !!contractAddress && !!address,
        }
    })

    const { data: projectDescription, isLoading: descriptionLoading } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: projectAbi,
        functionName: 'projectDescription',
        query: {
            enabled: !!contractAddress && !!address,
        }
    })

    const { data: projectCreator, isLoading: creatorLoading } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: projectAbi,
        functionName: 'getCreator',
        query: {
            enabled: !!contractAddress && !!address,
        }
    })

    const { data: projectStatus, isLoading: statusLoading } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: projectAbi,
        functionName: 'currentState',
        query: {
            enabled: !!contractAddress && !!address,
        }
    })

    const { data: availableTokens, isLoading: tokensLoading } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: projectAbi,
        functionName: 'getAvailableTokens',
        query: {
            enabled: !!contractAddress && !!address,
        }
    })

    const { data: isRegistered, isLoading: registrationLoading } = useReadContract({
        ...projectManagerAbi,
        functionName: 'isProjectRegistered',
        args: [contractAddress as `0x${string}`],
        query: {
            enabled: !!contractAddress && !!address,
        }
    })

    const { data: pricePerToken, isLoading: priceLoading } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: projectAbi,
        functionName: 'pricePerToken',
        query: {
            enabled: !!contractAddress && !!address,
        }
    })

    const { data: totalTokens, isLoading: totalTokensLoading } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: projectAbi,
        functionName: 'totalTokens',
        query: {
            enabled: !!contractAddress && !!address,
        }
    })

    const { data: isStaffOrAdmin, isLoading: isStaffLoading } = useReadContract({
        ...roleManagerAbi,
        functionName: 'isStaffOrAdmin',
        args: [address as `0x${string}`],
        query: {
            enabled: !!contractAddress && !!address,
        }
    })

    const { data: balance, isLoading: balanceLoading } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: projectAbi,
        functionName: 'getBalance',
        query: {
            enabled: !!contractAddress && !!address,
        }
    })

    const handleWithdraw = async () => {
        if (!amountToWithdraw || amountToWithdraw <= 0) {
            toast.error('Please enter a valid amount to withdraw')
            return
        }

        try {
            const result = writeContract({
                address: contractAddress as `0x${string}`,
                abi: projectAbi,
                functionName: 'withdrawETH',
                args: [BigInt(amountToWithdraw)],
            })
            console.log('Transaction hash:', result)
        } catch (error) {
            toast.error('Error withdrawing funds')
        }
    }

    async function updateStatus() {
        try {
            if (!projectStatus && projectStatus !== 0) {
                toast.error('Project status is not loaded yet')
                return
            }

            if (projectStatus >= 4) {
                toast.error('Project is already at maximum phase (Phase4)')
                return
            }

            const newStatus = (projectStatus as number) + 1

            const result = writeContract({
                ...projectManagerAbi,
                functionName: 'updateProjectStatus',
                args: [contractAddress as `0x${string}`, newStatus],
            })
            console.log('Transaction hash:', result)
            console.log(`Updating project status from Phase${projectStatus} to Phase${newStatus}`)
        } catch (error) {
            toast.error('Error updating project status:')
        }
    }

    async function buyCarbonCredits(amount: number) {
        if (!availableTokens || amount <= 0 || amount > Number(availableTokens)) {
            toast.error('Invalid amount of carbon credits to buy')
            return
        }

        if (!pricePerToken) {
            toast.error('Price per token is not loaded yet')
            return
        }

        try {
            const result = writeContract({
                address: contractAddress as `0x${string}`,
                abi: projectAbi,
                functionName: 'buyCarbonCredits',
                args: [BigInt(amount)],
                value: BigInt(pricePerToken) * BigInt(amount),
            })
            console.log('Transaction hash:', result)
        } catch (error) {
            toast.error('Error buying carbon credits')
        }
    }
    const { isLoading: isWaitingForReceipt, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
        hash,
    })

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

    const isLoading = nameLoading || descriptionLoading || creatorLoading || statusLoading || tokensLoading || registrationLoading || priceLoading || isStaffLoading || isWaitingForReceipt || isPending || totalTokensLoading || balanceLoading;

    if (!isLoading && !isRegistered) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="text-center">
                        <div className="text-4xl mb-4">❌</div>
                        <h2 className="text-xl font-bold text-red-800 mb-2">Project Not Found</h2>
                        <p className="text-red-600 mb-4">
                            This project is not registered in our system or the contract address is invalid.
                        </p>
                        <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
                            <p className="text-sm text-red-700">
                                <strong>Contract Address:</strong> {contractAddress}
                            </p>
                        </div>
                        <Link
                            to="/"
                            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="mr-2" />
                            Back to Projects
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <LoadingOverlay
                isLoading={isLoading}
                text="Loading..."
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
                        Back to Projects
                    </Link>

                    <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
                        <TreePine className="text-green-600 mr-3" size={32} />
                        {projectName || 'Loading...'}
                    </h1>
                </div>

                {/* Información principal del proyecto */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Project Details</h2>
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full bg-white ${(projectStatus ?? 0) === 0 ? 'border border-red-300' : 'border border-green-300'}`}>
                            <div className="text-lg">
                                {(projectStatus ?? 0) === 0 ? '🔴' : '🟢'}
                            </div>
                            <p className={`font-semibold ${(projectStatus ?? 0) === 0 ? 'text-red-700' : 'text-green-700'}`}>
                                {(projectStatus ?? 0) === 0 ? 'Inactive' : projectStatus === 4 && Number(availableTokens) === 0 ? "Completed" : "Active"}
                            </p>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Información básica */}
                            <div className="bg-gray-50 border border-green-200 rounded-lg p-4 text-start justify-start">
                                <div className="">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="text-green-500" />
                                        <label className="block text-md font-bold text-black ">
                                            Address
                                        </label>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg">
                                        <p className="text-gray-800 font-mono text-md break-all">
                                            {contractAddress}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <CircleUserRound className="text-green-500" />
                                        <label className="block text-md font-bold text-black mb-1 pt-2">
                                            Creator
                                        </label>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg">
                                        <p className="text-gray-800 font-mono text-md">
                                            {projectCreator}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <FileText className="text-green-500" />
                                    <label className="block text-md font-bold text-black mb-1 pt-2">
                                        Description
                                    </label>
                                </div>
                                <div className="bg-gray-50 rounded-lg">
                                    <p className="text-gray-800 leading-relaxed">
                                        {projectDescription || 'Loading project description...'}
                                    </p>
                                </div>
                            </div>

                            {/* Derecha del proyecto */}
                            <div>
                                <div className="bg-gray-50 border border-green-200 rounded-lg p-4 h-full flex flex-col">
                                    <div className="flex items-center justify-start gap-2 mb-6">
                                        <Leaf className="text-green-500" />
                                        <h3 className="font-extrabold text-lg text-green-500">Carbon Credits</h3>
                                    </div>

                                    <div className="flex flex-col items-start gap-4 mt-auto">
                                        <p className="text-black font-bold">Total tokens: <span className="text-green-600 font-bold">{totalTokens?.toString()}</span></p>
                                        <p className="text-black font-bold">Available: <span className="text-green-600 font-bold">{availableTokens?.toString()}</span></p>
                                        <p className="text-black font-bold">Price per CC: <span className="text-green-600 font-bold">{pricePerToken ? `${pricePerToken} WEI` : 'Loading...'}</span></p>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                min={1}
                                                max={availableTokens !== undefined ? Number(availableTokens) : undefined}
                                                value={amountToBuy}
                                                onChange={(e) => setAmountToBuy(Number(e.target.value))}
                                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 min-w-48"
                                                placeholder="Amount to Buy"
                                            />
                                            <button
                                                onClick={() => buyCarbonCredits(amountToBuy)}
                                                disabled={availableTokens === 0n || !pricePerToken || amountToBuy <= 0}
                                                className={`${availableTokens === 0n || !pricePerToken || amountToBuy <= 0 ? 'disabled bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-lg transform hover:scale-105'}  text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md  flex items-center space-x-2`}
                                            >
                                                <ShoppingBag className="text-white" />
                                                <span>Buy</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {isStaffOrAdmin && (
                    <div className="flex justify-end items-end mt-4">
                        <button
                            onClick={updateStatus}
                            disabled={!projectStatus && projectStatus !== 0 || (projectStatus ?? 0) >= 4}
                            className={`${(projectStatus ?? 0) >= 4
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-yellow-500 hover:bg-yellow-600 hover:shadow-lg transform hover:scale-105'
                                } text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2`}
                        >
                            <ArrowUp className="text-white" />
                            <span>
                                {(projectStatus ?? 0) >= 4
                                    ? 'Max Phase Reached (Phase4)'
                                    : `Update to Phase${((projectStatus ?? 0) as number) + 1}`
                                }
                            </span>
                        </button>
                    </div>
                )}
                <div className="mt-6 flex justify-end text-right gap-5">
                    {projectCreator === address && (<>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                            <span className="text-gray-600">Balance:</span>
                            <span className="text-green-600 font-bold">{balance ? `${balance} WEI` : 'Loading...'}</span>
                            </div>
                            <input
                                type="number"
                                min={1}
                                value={amountToWithdraw}
                                onChange={(e) => setAmountToWithdraw(Number(e.target.value))}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 min-w-48"
                                placeholder="Amount to Withdraw"
                            />
                            <button
                                onClick={() => handleWithdraw()}
                                className={'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-lg transform hover:scale-105 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md flex items-center space-x-2'}
                            >
                                <BanknoteArrowDown  className="text-white" />
                                <span>Withdraw</span>
                            </button>
                        </div>

                    </>)}

                </div>
            </div>

        </>
    )
}

export default ProjectDetail
