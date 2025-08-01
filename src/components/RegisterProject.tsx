import React from "react";
import { useWriteContract } from 'wagmi'
import { projectManagerAbi } from '../../contracts'


export function RegisterProject() {
    const { writeContract } = useWriteContract()
    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const totalTokens = formData.get('totalTokens') as string
        try {
            const result = writeContract({
                ...projectManagerAbi,
                functionName: 'registerProject',
                args: [name, description, import.meta.env.VITE_CARBON_CREDIT_CONTRACT_ADDRESS as `0x${string}`, BigInt(totalTokens)],
            })
            console.log('Transaction hash:', result)
        } catch (error) {
            console.error('Error registering project:', error)
        }
    }
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        Register New Project
                    </h3>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                    placeholder="e.g., Amazon Reforestation Initiative"
                                />
                            </div>

                            <div>
                                <label htmlFor="totalTokens" className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Carbon Credits
                                </label>
                                <input
                                    type="number"
                                    name="totalTokens"
                                    id="totalTokens"
                                    required
                                    min="1"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                    placeholder="1000"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Project Description
                            </label>
                            <textarea
                                name="description"
                                id="description"
                                required
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                placeholder="Describe your carbon credit project, its impact, and methodology..."
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
                            >
                                <span>🌱</span>
                                <span>Register Project</span>
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}