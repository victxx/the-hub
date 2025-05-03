import { CrtEffect } from "@/components/crt-effect"
import { Cartucho } from "@/components/cartucho"
import { PlusIcon } from "lucide-react"

export default function Home() {
  // Placeholder data for one cartucho
  const cartuchos = [
    {
      id: "001",
      title: "TRIAL OF FIRE",
      description:
        "Brave the scorching digital inferno and face your deepest fears. Only the worthy will emerge from the flames unscathed.",
      difficulty: "Medium",
      timeEstimate: "5 min",
    },
  ]

  return (
    <CrtEffect>
      <main className="flex min-h-screen flex-col items-center justify-between p-12">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
          <h1 className="text-4xl font-bold text-center mb-8 text-orange-500 glow-orange">Welcome to The Hub</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 w-full max-w-5xl">
          {cartuchos.map((cartucho) => (
            <Cartucho key={cartucho.id} cartucho={cartucho} />
          ))}
          
          {/* Cartucho Coming Soon */}
          <div className="border-4 border-orange-500/50 border-dashed bg-gray-900/50 p-6 rounded-lg relative overflow-hidden">
            <div className="flex flex-col items-center justify-center h-48">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-orange-500/70 flex items-center justify-center mb-4">
                <PlusIcon className="w-8 h-8 text-orange-500/70" />
              </div>
              <p className="text-xl text-orange-500/70 font-bold tracking-wider">NEW CARTUCHO COMING SOON</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <p className="text-center text-orange-300 text-lg">
            created by victorxva with &lt;3 at ETHCincoDeMayo
          </p>
        </div>
        
        <div className="mt-4 text-center text-orange-400/60 text-sm">
          THE HUB // SYSTEM V0.8.5
        </div>
      </main>
    </CrtEffect>
  )
}
