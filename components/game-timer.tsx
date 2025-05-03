"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface GameTimerProps {
  initialTime?: number // in seconds
  onTimeExpired?: () => void
  onTimeChange?: (timeLeft: number) => void
}

export function GameTimer({ initialTime = 300, onTimeExpired, onTimeChange }: GameTimerProps) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1
          // Call the onTimeChange callback when time updates
          if (onTimeChange) {
            onTimeChange(newTime)
          }
          return newTime
        })
      }, 1000)
    } else if (timeLeft === 0) {
      // Time's up
      if (onTimeExpired) {
        onTimeExpired()
      } else {
        // Si no se proporciona callback, redirigir a página de derrota por defecto
        router.push("/result/defeat")
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, router, onTimeExpired, onTimeChange])

  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

  return (
    <div className="bg-gray-900 border-2 border-orange-500 px-4 py-2 rounded-md">
      <span className="text-xl text-orange-400 glow-orange">TIME LEFT: {formattedTime}</span>
    </div>
  )
}
