"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { OTPForm } from "@/components/otp-form"

function OTPContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  // Se não tem email, redireciona para signup
  if (!email) {
    if (typeof window !== "undefined") {
      window.location.href = "/signup"
    }
    return null
  }

  return <OTPForm email={email} />
}

export default function OTPPage() {
  return (
    <div className="flex min-h-svh w-full">
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-xs">
          <Suspense fallback={<div>Carregando...</div>}>
            <OTPContent />
          </Suspense>
        </div>
      </div>
      <div className="relative hidden w-1/2 lg:block">
        <img
          alt="Authentication"
          className="absolute inset-0 h-full w-full object-cover"
          height={1080}
          src="/placeholder.svg"
          width={1920}
        />
      </div>
    </div>
  )
}
