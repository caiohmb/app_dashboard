import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function getBrowserInfo(userAgent: string | null) {
  if (!userAgent) return "Desconhecido"

  if (userAgent.includes("Chrome")) return "Chrome"
  if (userAgent.includes("Firefox")) return "Firefox"
  if (userAgent.includes("Safari")) return "Safari"
  if (userAgent.includes("Edge")) return "Edge"

  return "Outro"
}
