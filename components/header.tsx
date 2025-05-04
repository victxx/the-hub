"use client"

import { Logo } from "./logo"
import { MainWalletConnect } from "./main-wallet-connect"

export function Header() {
  return (
    <header className="z-10 w-full max-w-5xl flex justify-between items-center mb-16">
      <Logo width={180} height={60} />
      <div className="flex items-center gap-3">
        <MainWalletConnect />
      </div>
    </header>
  )
} 