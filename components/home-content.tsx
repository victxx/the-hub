"use client"

import { Cartucho } from "@/components/cartucho"
import { PlusIcon, FlameIcon, Layers3Icon, LightbulbIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { useAccount } from "wagmi"

// Filter types
type FilterType = 'all' | 'owned' | 'upcoming';

// Placeholder data for one cartucho
const cartuchos = [
  {
    id: "001",
    title: "TRIAL OF FIRE",
    description:
      "Walk into the ancient flame and let instinct guide your fate. Those who choose wisely may escape. The rest become ash.",
    difficulty: "Medium",
    timeEstimate: "5 min",
    price: "0.01" // Price in CAMP
  },
  {
    id: "002",
    title: "5 DE MAYO",
    description:
      "A weekend of building and enjoying! What project will you create? What food will you eat? Which parties will you attend? An adventure full of choices - will you win the hackathon?",
    difficulty: "Easy",
    timeEstimate: "10 min",
    price: "0.02", // Price in CAMP
    comingSoon: true
  },
]

export function HomeContent() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const { isConnected } = useAccount()
  const [ownedCartuchoIds, setOwnedCartuchoIds] = useState<string[]>([])
  
  // Cargar los cartuchos en propiedad del usuario desde localStorage
  useEffect(() => {
    const checkOwnedCartuchos = () => {
      if (typeof window !== 'undefined') {
        try {
          const owned = JSON.parse(localStorage.getItem('ownedCartuchos') || '[]');
          setOwnedCartuchoIds(owned);
        } catch (error) {
          console.error("Error loading owned cartuchos:", error);
          setOwnedCartuchoIds([]);
        }
      }
    };
    
    checkOwnedCartuchos();
    
    // Escuchar cambios en localStorage
    window.addEventListener('storage', checkOwnedCartuchos);
    
    return () => {
      window.removeEventListener('storage', checkOwnedCartuchos);
    };
  }, [isConnected]);
  
  // Filter cartuchos based on selected filter
  const filteredCartuchos = cartuchos.filter(cartucho => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'owned') {
      // Mostrar solo los cartuchos que el usuario posee
      return isConnected && ownedCartuchoIds.includes(cartucho.id);
    }
    if (activeFilter === 'upcoming') return cartucho.comingSoon === true;
    return true;
  });

  // Crear un evento personalizado para actualizar los cartuchos en propiedad
  useEffect(() => {
    const updateOwnedCartuchos = () => {
      try {
        const owned = JSON.parse(localStorage.getItem('ownedCartuchos') || '[]');
        setOwnedCartuchoIds(owned);
      } catch (error) {
        console.error("Error updating owned cartuchos:", error);
      }
    };
    
    // Crear y registrar el evento personalizado
    const handleCustomEvent = () => updateOwnedCartuchos();
    window.addEventListener('cartuchosPurchased', handleCustomEvent);
    
    // También actualizar cada vez que se muestra la página
    updateOwnedCartuchos();
    
    return () => {
      window.removeEventListener('cartuchosPurchased', handleCustomEvent);
    };
  }, []);

  return (
    <div className="w-full max-w-5xl flex-1 flex flex-col">
      {/* Filter Bubbles */}
      <div className="flex flex-col mb-16">
        <div className="flex justify-start ml-2 gap-2 md:gap-3 mb-8">
          <button
            onClick={() => setActiveFilter('all')}
            className={`glass-bubble rounded-full px-3 py-1.5 font-bold text-sm transition-all flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-orange-600/80 text-white'
                : 'bg-gray-800/40 text-orange-400 hover:bg-gray-700/50'
            }`}
          >
            <Layers3Icon className="w-3.5 h-3.5" />
            <span>All</span>
          </button>
          
          <button
            onClick={() => setActiveFilter('owned')}
            className={`glass-bubble rounded-full px-3 py-1.5 font-bold text-sm transition-all flex items-center gap-1.5 ${
              activeFilter === 'owned'
                ? 'bg-orange-600/80 text-white'
                : 'bg-gray-800/40 text-orange-400 hover:bg-gray-700/50'
            }`}
          >
            <FlameIcon className="w-3.5 h-3.5" />
            <span>Owned</span>
          </button>
          
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`glass-bubble rounded-full px-3 py-1.5 font-bold text-sm transition-all flex items-center gap-1.5 ${
              activeFilter === 'upcoming'
                ? 'bg-orange-600/80 text-white'
                : 'bg-gray-800/40 text-orange-400 hover:bg-gray-700/50'
            }`}
          >
            <LightbulbIcon className="w-3.5 h-3.5" />
            <span>Upcoming</span>
          </button>
        </div>
        
        {/* Wallet Connection Message */}
        {activeFilter === 'owned' && !isConnected && (
          <div className="glass-effect text-center mb-6 p-5 border border-orange-500/50 rounded-lg">
            <p className="text-orange-400">Connect your wallet to view your owned experiences</p>
          </div>
        )}
        
        {/* Cartuchos display based on filter */}
        <div className="space-y-6">
          {activeFilter === 'upcoming' ? (
            <div className="glass-card border-2 border-orange-500/50 p-8 rounded-xl relative overflow-hidden" style={{ borderStyle: 'dashed', borderWidth: '2px', borderRadius: '12px' }}>
              <div className="flex flex-col items-center justify-center h-56">
                <div className="w-20 h-20 rounded-full border border-orange-500/70 flex items-center justify-center mb-6 glass-bubble" style={{ borderStyle: 'dashed', borderSpacing: '10px' }}>
                  <LightbulbIcon className="w-10 h-10 text-orange-500/70" />
                </div>
                <p className="text-xl md:text-2xl text-orange-500/50 font-bold tracking-wider mb-2 font-psygen glow-orange-subtle">NEW EXPERIENCES COMING SOON</p>
                <p className="text-orange-400/70 text-center max-w-md">Stay tuned for upcoming stories from creators around the world</p>
              </div>
            </div>
          ) : (
            filteredCartuchos.map((cartucho) => (
              <Cartucho key={cartucho.id} cartucho={cartucho} />
            ))
          )}
          
          {/* Show empty state if no cartuchos in filter */}
          {activeFilter === 'owned' && isConnected && filteredCartuchos.length === 0 && (
            <div className="glass-effect text-center p-8 border border-orange-500/50 rounded-lg">
              <div className="flex flex-col items-center">
                <FlameIcon className="w-12 h-12 text-orange-500/70 mb-4" />
                <p className="text-orange-400 text-lg mb-2">You don't own any experiences yet</p>
                <p className="text-orange-300/70">Purchase an experience to see it in your collection</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 