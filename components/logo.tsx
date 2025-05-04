"use client"

import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = "", width = 150, height = 50 }: LogoProps) {
  return (
    <Link href="/" className={`block ${className} hover:opacity-90 transition-opacity`}>
      <Image 
        src="/THE HUB LOGO.svg"
        alt="The Hub Logo"
        width={width}
        height={height}
        className="glow-orange"
        priority
      />
    </Link>
  )
} 