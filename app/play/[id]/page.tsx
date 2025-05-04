"use client"

import { useEffect, useState } from "react"
import { CrtEffect } from "@/components/crt-effect"
import Link from "next/link"
import { GameTimer } from "@/components/game-timer"
import { useRouter } from "next/navigation"
import { useStory } from "@/hooks/use-story"
import { Logo } from "@/components/logo"

interface PlayPageProps {
  params: {
    id: string
  }
}

export default function PlayPage({ params }: PlayPageProps) {
  const { id } = params
  const router = useRouter()
  const [timeExpired, setTimeExpired] = useState(false)
  
  const { state, chooseOption, resetStory, setTimeRemaining } = useStory();
  
  // Cuando se acaba el tiempo
  const handleTimeExpired = () => {
    setTimeExpired(true);
    setTimeout(() => {
      router.push("/result/defeat");
    }, 2000);
  };
  
  // Si el juego termina, redirige al resultado apropiado
  useEffect(() => {
    if (state.gameOver) {
      // Store the time remaining in localStorage before redirecting
      if (state.success && state.timeRemaining !== null) {
        localStorage.setItem('successTimeRemaining', state.timeRemaining.toString());
      }
      
      setTimeout(() => {
        router.push(state.success ? "/result/success" : "/result/defeat");
      }, 2000);
    }
  }, [state.gameOver, state.success, router, state.timeRemaining]);

  return (
    <CrtEffect>
      <main className="min-h-screen bg-black text-orange-400 font-mono p-4 md:p-8 flex flex-col relative">
        <div className="container mx-auto flex-1 flex flex-col relative z-10">
          {/* Header with timer */}
          <div className="flex justify-between items-center mb-6">
            <Logo width={150} height={50} />
            {!timeExpired && !state.gameOver && (
              <GameTimer 
                initialTime={300} 
                onTimeExpired={handleTimeExpired}
                onTimeChange={setTimeRemaining}
              />
            )}
          </div>

          {/* Game screen */}
          <div className="flex-1 border-4 border-orange-500 bg-gray-900 rounded-lg p-6 mb-6 relative overflow-hidden">
            {/* Scanlines effect */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="h-px bg-orange-400 opacity-10"
                  style={{
                    position: "absolute",
                    top: `${i * 2}%`,
                    left: 0,
                    right: 0,
                  }}
                />
              ))}
            </div>

            {/* Narrative text */}
            <div className="relative z-10 text-lg md:text-xl leading-relaxed mb-8 text-orange-300">
              {state.loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="inline-block h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : timeExpired ? (
                <>
                  <p className="text-red-500/70 text-2xl mb-4 font-psygen">¡TIEMPO AGOTADO!</p>
                  <p className="mb-4">El calor se vuelve insoportable mientras las llamas consumen todo a tu alrededor.</p>
                  <p className="mb-4">La cueva colapsa sobre ti, has muerto.</p>
                </>
              ) : state.gameOver ? (
                <>
                  <p className="text-2xl mb-4 font-psygen">
                    {state.success 
                      ? <span className="text-orange-500/70">¡VICTORIA!</span>
                      : <span className="text-red-500/70">DERROTA</span>
                    }
                  </p>
                  <p className="mb-4">
                    {state.success 
                      ? "¡Has logrado escapar de la cueva! La luz del exterior te saluda mientras emerges victorioso."
                      : "Tu viaje ha llegado a su fin, atrapado en las profundidades de la cueva para siempre."}
                  </p>
                </>
              ) : state.error ? (
                <p className="text-red-500">Error: {state.error}</p>
              ) : (
                <>
                  {state.storyHistory.length > 1 && (
                    <div className="mb-6 opacity-60 pb-4 border-b border-orange-500/30">
                      <p className="italic mb-2">Decisión anterior: {state.storyHistory[state.storyHistory.length - 1].chosenOption}</p>
                    </div>
                  )}
                  <p className="mb-4">{state.currentSegment?.narrative}</p>
                </>
              )}
            </div>
          </div>

          {/* Option buttons */}
          {!state.loading && !timeExpired && !state.gameOver && state.currentSegment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {state.currentSegment.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => chooseOption(index)}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-6 rounded-md text-xl tracking-wider transition-all hover:scale-105"
                >
                  {option.text}
                </button>
              ))}
            </div>
          )}

          {/* Return button */}
          <div className="text-center">
            <Link href="/">
              <button className="bg-gray-800 hover:bg-gray-700 text-orange-400 px-4 py-2 rounded-md font-bold tracking-wider transition-all">
                &lt; RETURN TO HUB &gt;
              </button>
            </Link>
          </div>
        </div>
      </main>
    </CrtEffect>
  )
}
