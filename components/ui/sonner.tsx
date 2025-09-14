"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-inherit group-[.toast]:opacity-90",
          actionButton: "group-[.toast]:bg-white/20 group-[.toast]:text-white hover:group-[.toast]:bg-white/30",
          cancelButton: "group-[.toast]:bg-white/10 group-[.toast]:text-white hover:group-[.toast]:bg-white/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
