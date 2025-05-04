"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { useAccount, useBalance } from "wagmi"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface BuyCartuchoProps {
  cartuchoId: string
  cartuchoTitle: string
  price: string // In CAMP
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BuyCartucho({ cartuchoId, cartuchoTitle, price, isOpen, onClose, onSuccess }: BuyCartuchoProps) {
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'signing' | 'processing' | 'completed' | 'error'>('idle')
  
  // Check CAMP balance
  const { data: balanceData } = useBalance({
    address,
  })

  const hasEnoughBalance = balanceData && parseFloat(balanceData.formatted) >= parseFloat(price)
  
  const handleBuy = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first")
      return
    }
    
    if (!hasEnoughBalance) {
      toast.error(`You need at least ${price} CAMP to purchase this cartucho`)
      return
    }
    
    setIsLoading(true)
    setTransactionStatus('signing')
    
    try {
      // Simplificamos el proceso de compra para evitar el error
      if (!window.ethereum) {
        throw new Error('Ethereum provider not found');
      }
      
      // Solicitar cuentas
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No account connected. Please connect your wallet.');
      }
      
      // Verificar la red
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);
      
      // ID de Base Camp testnet
      const baseCampId = 123420001114;
      
      if (currentChainId !== baseCampId) {
        throw new Error(`Please switch to Base Camp network. Current chain ID: ${currentChainId}`);
      }
      
      setTransactionStatus('signing')
      toast.info("Please confirm the transaction in your wallet")
      
      // Simular una compra - simplemente registramos que el usuario ha comprado el cartucho
      // En una aplicación real, aquí se enviaría una transacción a un contrato
      console.log(`User ${accounts[0]} bought cartucho ${cartuchoId} for ${price} CAMP`);
      
      // Simular un delay para que parezca que está procesando
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTransactionStatus('completed')
      toast.success(`Successfully purchased ${cartuchoTitle}!`);
      
      // Almacenar en localStorage para simular propiedad
      const ownedCartuchos = JSON.parse(localStorage.getItem('ownedCartuchos') || '[]');
      if (!ownedCartuchos.includes(cartuchoId)) {
        ownedCartuchos.push(cartuchoId);
        localStorage.setItem('ownedCartuchos', JSON.stringify(ownedCartuchos));
        
        // Disparar evento personalizado para actualizar la UI
        const purchasedEvent = new Event('cartuchosPurchased');
        window.dispatchEvent(purchasedEvent);
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Error buying cartucho:", error)
      setTransactionStatus('error')
      
      if (error.message) {
        toast.error(error.message)
      } else {
        toast.error("Failed to purchase cartucho. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const getButtonText = () => {
    switch(transactionStatus) {
      case 'signing':
        return 'Confirm in wallet...'
      case 'processing':
        return 'Processing...'
      case 'completed':
        return 'Purchase complete!'
      case 'error':
        return 'Try again'
      default:
        return `Buy for ${price} CAMP`
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-effect border-2 border-orange-500/70 text-orange-300 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-orange-500 font-psygen glow-orange-subtle">Purchase Cartucho</DialogTitle>
          <DialogDescription className="text-orange-400/80">
            You need to purchase this experience before you can play it
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex justify-between items-center mb-4 p-3 glass-bubble bg-gray-800/30 rounded-lg border border-orange-500/30">
            <span>Cartucho ID</span>
            <span className="font-bold">{cartuchoId}</span>
          </div>
          
          <div className="flex justify-between items-center mb-4 p-3 glass-bubble bg-gray-800/30 rounded-lg border border-orange-500/30">
            <span>Price</span>
            <span className="font-bold">{price} CAMP</span>
          </div>
          
          <div className="flex justify-between items-center mb-4 p-3 glass-bubble bg-gray-800/30 rounded-lg border border-orange-500/30">
            <span>Creator Royalty</span>
            <span className="font-bold">10%</span>
          </div>
          
          {balanceData && (
            <div className="flex justify-between items-center mb-4 p-3 glass-bubble bg-gray-800/30 rounded-lg border border-orange-500/30">
              <span>Your Balance</span>
              <span className={`font-bold ${hasEnoughBalance ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(balanceData.formatted).toFixed(4)} CAMP
              </span>
            </div>
          )}
          
          <div className="glass-bubble bg-gray-800/20 p-3 rounded-lg border border-orange-500/20 text-sm">
            <p>By purchasing this cartucho, you gain access to play the game. A portion of the sale will go to the IP creator.</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading && transactionStatus !== 'error'}
            className="border-2 border-orange-500/50 text-orange-500 hover:bg-orange-500/10 rounded-full hover:shadow-[0_0_10px_rgba(249,115,22,0.3)]"
          >
            {transactionStatus === 'completed' ? 'Close' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleBuy}
            disabled={isLoading || !isConnected || !hasEnoughBalance}
            className={`${
              transactionStatus === 'completed' 
                ? 'bg-green-600 hover:bg-green-500 border-green-600' 
                : transactionStatus === 'error'
                ? 'bg-red-600 hover:bg-red-500 border-red-600'
                : 'bg-orange-600 hover:bg-orange-500 border-orange-600'
            } text-white rounded-full border-2 hover:shadow-[0_0_10px_rgba(249,115,22,0.5)] font-psygen text-lg`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {getButtonText()}
              </>
            ) : (
              getButtonText()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 