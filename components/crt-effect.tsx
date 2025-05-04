"use client"

import type { ReactNode } from "react"

interface CrtEffectProps {
  children: ReactNode
}

export function CrtEffect({ children }: CrtEffectProps) {
  return (
    <div className="crt-container">
      <div className="crt-effect">{children}</div>
      <style jsx global>{`
        @keyframes flicker {
          0% { opacity: 0.97; }
          5% { opacity: 0.95; }
          10% { opacity: 0.97; }
          15% { opacity: 0.94; }
          20% { opacity: 0.98; }
          25% { opacity: 0.95; }
          30% { opacity: 0.97; }
          35% { opacity: 0.96; }
          40% { opacity: 0.97; }
          45% { opacity: 0.94; }
          50% { opacity: 0.98; }
          55% { opacity: 0.96; }
          60% { opacity: 0.97; }
          65% { opacity: 0.95; }
          70% { opacity: 0.97; }
          75% { opacity: 0.94; }
          80% { opacity: 0.98; }
          85% { opacity: 0.96; }
          90% { opacity: 0.97; }
          95% { opacity: 0.95; }
          100% { opacity: 0.98; }
        }

        .crt-container {
          background: linear-gradient(to right, rgb(31, 41, 55), rgb(11, 15, 25), rgb(0, 0, 0));
          overflow: hidden;
          position: relative;
          min-height: 100vh;
          width: 100%;
        }

        .crt-effect {
          position: relative;
          min-height: 100vh;
          animation: flicker 0.15s infinite;
          overflow: hidden;
          width: 100%;
        }

        .crt-effect::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 128, 0, 0.06), rgba(255, 180, 0, 0.02), rgba(255, 100, 0, 0.06));
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
          z-index: 100;
        }

        .crt-effect::after {
          content: " ";
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: rgba(18, 16, 16, 0.1);
          opacity: 0;
          z-index: 101;
          pointer-events: none;
        }

        /* Asegurarnos de que los colores y brillos estén correctamente definidos */
        .text-orange-300 {
          color: #ffb366 !important;
        }
        .text-orange-400 {
          color: #ff9933 !important;
        }
        .text-orange-500 {
          color: #ff8000 !important;
        }
        .text-orange-600 {
          color: #cc6600 !important;
        }
        .bg-orange-300 {
          background-color: #ffb366 !important;
        }
        .bg-orange-400 {
          background-color: #ff9933 !important;
        }
        .bg-orange-500 {
          background-color: #ff8000 !important;
        }
        .bg-orange-600 {
          background-color: #cc6600 !important;
        }
        .border-orange-500 {
          border-color: #ff8000 !important;
        }
        .border-orange-600 {
          border-color: #cc6600 !important;
        }

        .glow-orange {
          text-shadow: 0 0 5px #ff8000, 0 0 10px #ff8000, 0 0 15px #ff8000, 0 0 20px #ff8000 !important;
        }

        .glow-green {
          text-shadow: 0 0 5px #0f0, 0 0 10px #0f0, 0 0 15px #0f0, 0 0 20px #0f0 !important;
        }

        .glow-cyan {
          text-shadow: 0 0 5px #0ff, 0 0 10px #0ff, 0 0 15px #0ff, 0 0 20px #0ff !important;
        }
      `}</style>
    </div>
  )
}
