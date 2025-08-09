import { useEffect, useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, type BaseError } from 'wagmi';
import { roleManagerAbi } from '../../contracts';
import LoadingOverlay from "./LoadingOverlay";
import { toast } from "react-toastify";
import { Shield, UserPlus, Users, UserMinus } from "lucide-react";

export function Admin() {
    const { address } = useAccount();
    const { data: hash, isPending, writeContract, error } = useWriteContract();
    const [staffAddress, setStaffAddress] = useState<string>('');
    const [removeStaffAddress, setRemoveStaffAddress] = useState<string>('');

    const { data: admin, isLoading: adminLoading } = useReadContract({
        ...roleManagerAbi,
        functionName: 'admin',
        query: {
            enabled: !!address,
        }
    });

    const { isLoading: isWaitingForReceipt, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const handleAddStaff = async () => {
        if (!staffAddress) {
            toast.error('Please enter a staff address');
            return;
        }

        if (!staffAddress.startsWith('0x') || staffAddress.length !== 42) {
            toast.error('Please enter a valid Ethereum address');
            return;
        }

        try {
            const result = await writeContract({
                ...roleManagerAbi,
                functionName: 'addStaff',
                args: [staffAddress as `0x${string}`],
            });
            console.log('Transaction initiated:', result);
            toast.info('Transaction submitted, please wait for confirmation...');
        } catch (error) {
            console.error('Error adding staff:', error);
            toast.error('Error adding staff');
        }
    };

    const handleRemoveStaff = async () => {
        if (!removeStaffAddress) {
            toast.error('Please enter a staff address to remove');
            return;
        }

        if (!removeStaffAddress.startsWith('0x') || removeStaffAddress.length !== 42) {
            toast.error('Please enter a valid Ethereum address');
            return;
        }

        try {
            const result = await writeContract({
                ...roleManagerAbi,
                functionName: 'removeStaff',
                args: [removeStaffAddress as `0x${string}`],
            });
            console.log('Remove staff transaction initiated:', result);
            toast.info('Transaction submitted, please wait for confirmation...');
        } catch (error) {
            console.error('Error removing staff:', error);
            toast.error('Error removing staff');
        }
    };

    useEffect(() => {
        if (isReceiptSuccess) {
            toast.success('Staff operation completed successfully!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setStaffAddress(''); // Clear the add input after successful operation
            setRemoveStaffAddress(''); // Clear the remove input after successful operation
        }
    }, [isReceiptSuccess]);

    const isLoading = adminLoading || isWaitingForReceipt || isPending;

    // Check if current user is admin
    const isAdmin = address && admin && address === admin;

    if (!address) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="text-center">
                        <div className="text-4xl mb-4">🔒</div>
                        <h2 className="text-xl font-bold text-yellow-800 mb-2">Wallet Not Connected</h2>
                        <p className="text-yellow-600 mb-4">
                            Please connect your wallet to access the admin panel.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isLoading && !isAdmin) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="text-center">
                        <div className="text-4xl mb-4">🚫</div>
                        <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
                        <p className="text-red-600 mb-4">
                            You don't have admin privileges to access this page.
                        </p>
                        <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
                            <p className="text-sm text-red-700">
                                <strong>Your Address:</strong> {address}
                            </p>
                            <p className="text-sm text-red-700">
                                <strong>Admin Address:</strong> {admin || 'Loading...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <LoadingOverlay isLoading={isLoading} text="Processing..." />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
                        <Shield className="text-blue-600 mr-3" size={32} />
                        Admin Panel
                    </h1>
                    <p className="text-gray-600 mt-2">Manage staff members and system permissions</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                        <h2 className="text-xl font-semibold flex items-center">
                            <Users className="mr-2" size={24} />
                            Staff Management
                        </h2>
                        <p className="text-blue-100 mt-1">Add new staff members to the system</p>
                    </div>

                    <div className="p-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="text-blue-600" size={20} />
                                <h3 className="font-semibold text-blue-800">Current Admin</h3>
                            </div>
                            <p className="text-blue-700 font-mono text-sm">
                                {admin || 'Loading...'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Staff Ethereum Address
                                </label>
                                <input
                                    type="text"
                                    value={staffAddress}
                                    onChange={(e) => setStaffAddress(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Enter the Ethereum address of the user you want to add as staff
                                </p>
                            </div>

                            <button
                                onClick={handleAddStaff}
                                disabled={!staffAddress || isPending}
                                className={`${
                                    !staffAddress || isPending
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105'
                                } text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md flex items-center space-x-2 w-full justify-center`}
                            >
                                <UserPlus size={20} />
                                <span>{isPending ? 'Adding Staff...' : 'Add Staff Member'}</span>
                            </button>
                        </div>

                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <UserMinus className="text-red-600 mr-2" size={20} />
                                Remove Staff
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Staff Ethereum Address to Remove
                                    </label>
                                    <input
                                        type="text"
                                        value={removeStaffAddress}
                                        onChange={(e) => setRemoveStaffAddress(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Enter the Ethereum address of the staff member you want to remove
                                    </p>
                                </div>

                                <button
                                    onClick={handleRemoveStaff}
                                    disabled={!removeStaffAddress || isPending}
                                    className={`${
                                        !removeStaffAddress || isPending
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105'
                                    } text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md flex items-center space-x-2 w-full justify-center`}
                                >
                                    <UserMinus size={20} />
                                    <span>{isPending ? 'Removing Staff...' : 'Remove Staff Member'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-red-800 font-semibold mb-2">Transaction Error:</div>
                        <div className="text-red-600 text-sm">
                            {(error as BaseError).shortMessage || error.message}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Admin;
