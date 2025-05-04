"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { getUserCartuchos } from "@/lib/contract"
import { Loader2, Grid, List } from "lucide-react"

// Contract address for CartuchoRegistry
const CONTRACT_ADDRESS = '0x3Bf712949b4C5376F8b3fcd004BEf974F0702D62'

interface Cartucho {
  id: number
  uri: string
  details?: {
    title?: string
    description?: string
    image?: string
    attributes?: Array<{
      trait_type: string
      value: string | number
    }>
    [key: string]: any
  }
}

type FilterType = 'all' | 'acquired' | 'pending';

export function UserCartuchos() {
  const { address, isConnected } = useAccount()
  const [cartuchos, setCartuchos] = useState<Cartucho[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Add a state to track if we've loaded data client-side
  const [hasLoaded, setHasLoaded] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    async function fetchCartuchos() {
      if (!isConnected || !address) {
        setHasLoaded(true)
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        const userCartuchos = await getUserCartuchos(address)
        
        // Fetch details for each cartucho
        const cartuchosWithDetails = await Promise.all(
          userCartuchos.map(async (cartucho) => {
            try {
              // Try to fetch the JSON data from the URI
              const response = await fetch(cartucho.uri as string)
              const details = await response.json()
              return { ...cartucho, uri: cartucho.uri as string, details }
            } catch (error) {
              // If we can't fetch the details, just return the cartucho as is
              console.error(`Error fetching details for cartucho ${cartucho.id}:`, error)
              return { ...cartucho, uri: cartucho.uri as string }
            }
          })
        )
        
        setCartuchos(cartuchosWithDetails as Cartucho[])
      } catch (error) {
        console.error("Error fetching cartuchos:", error)
        // Instead of showing error, just hide the component
        setIsVisible(false)
      } finally {
        setLoading(false)
        setHasLoaded(true)
      }
    }
    
    fetchCartuchos()
  }, [address, isConnected])

  // Don't show anything if there's an error instead of an error message
  if (!isVisible) {
    return null;
  }

  // Start with a loading state for both server and client
  if (!hasLoaded) {
    return (
      <div className="border-4 border-gray-700 bg-gray-900 p-6 rounded-lg">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin mr-2" />
          <p className="text-orange-400">Loading your cartuchos...</p>
        </div>
      </div>
    )
  }

  // After client-side effect has run, we can show different views based on actual state
  if (!isConnected) {
    return (
      <div className="border-4 border-gray-700 bg-gray-900 p-6 rounded-lg">
        <p className="text-orange-400 text-center">Connect your wallet to view your cartuchos</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="border-4 border-gray-700 bg-gray-900 p-6 rounded-lg">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin mr-2" />
          <p className="text-orange-400">Loading your cartuchos...</p>
        </div>
      </div>
    )
  }

  // If no cartuchos, don't show the component
  if (cartuchos.length === 0) {
    return null;
  }

  // Filter cartuchos based on active filter
  const filteredCartuchos = cartuchos.filter(cartucho => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'acquired') return true; // In a real app, filter based on status
    if (activeFilter === 'pending') return false; // In a real app, filter based on status
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-orange-500 glow-orange">Your Collection</h2>
        
        <div className="flex bg-gray-800 rounded-md overflow-hidden">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 text-sm font-medium ${
              activeFilter === 'all' 
                ? 'bg-orange-600 text-white' 
                : 'text-orange-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveFilter('acquired')}
            className={`px-4 py-2 text-sm font-medium ${
              activeFilter === 'acquired' 
                ? 'bg-orange-600 text-white' 
                : 'text-orange-300 hover:bg-gray-700'
            }`}
          >
            Acquired
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {filteredCartuchos.map((cartucho) => (
          <div 
            key={cartucho.id}
            className="border-4 border-orange-500 bg-gray-900 p-6 rounded-lg transform transition-all hover:scale-[1.02] hover:border-orange-400 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-6 relative z-10">
              {/* Cartucho "cartridge" visual */}
              <div className="flex-shrink-0 w-full md:w-40 h-40 bg-gray-800 border-4 border-orange-600 flex items-center justify-center rounded-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-700/20 to-orange-500/10"></div>
                <div className="text-3xl font-bold text-orange-400 glow-orange tracking-widest rotate-90 md:rotate-0">
                  #{cartucho.id}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-orange-500 glow-orange tracking-wider mb-2">
                  {cartucho.details?.title || `Cartucho #${cartucho.id}`}
                </h3>

                <p className="text-orange-300 mb-4 leading-relaxed">
                  {cartucho.details?.description || "No description available"}
                </p>

                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="flex flex-wrap gap-2">
                    {cartucho.details?.attributes?.map((attr, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-gray-800 text-orange-300 text-sm rounded"
                      >
                        {attr.trait_type}: {attr.value}
                      </span>
                    ))}
                  </div>
                  
                  <a
                    href={`https://basecamp.cloud.blockscout.com/token/${CONTRACT_ADDRESS}/${cartucho.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-md font-bold tracking-wider transition-all hover:scale-105 text-sm flex items-center justify-center"
                  >
                    View on Blockscout
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 