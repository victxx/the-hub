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
        </div>

        <div className="flex justify-center mt-12">
          <p className="text-center text-orange-300 text-lg">
            Your Retro Hackathon Project with Web3 Integration
          </p>
        </div>
      </main>
    </CrtEffect>
  )
}
