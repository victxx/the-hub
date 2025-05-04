"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-gray-900 border-orange-500 border text-orange-300 flex items-center gap-2 overflow-hidden",
          title: "toast-title text-orange-400 font-semibold",
          description: "toast-description text-orange-300",
          actionButton: "bg-orange-500 text-white",
          cancelButton: "bg-gray-800 text-orange-300",
          success: "success border-green-500 text-green-400",
          error: "error border-red-500 text-red-400",
          info: "info border-blue-500 text-blue-400",
          warning: "warning border-yellow-500 text-yellow-400",
        },
      }}
      {...props}
    />
  )
}
