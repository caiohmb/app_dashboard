"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"

interface OTPFormProps extends React.ComponentProps<"div"> {
  email: string
  onSuccess?: () => void
}

export function OTPForm({ email, onSuccess, className, ...props }: OTPFormProps) {
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleContinue = () => {
    // Redireciona para login após o usuário confirmar que verificou o email
    if (onSuccess) {
      onSuccess()
    } else {
      window.location.href = "/login"
    }
  }

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResending(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: "/dashboard",
      })
      setSuccessMessage("Email de verificação reenviado!")
    } catch (err) {
      setError("Erro ao reenviar email. Tente novamente.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Verifique seu email</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enviamos um link de verificação para <strong>{email}</strong>
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 text-center">
            {successMessage}
          </div>
        )}

        <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-muted-foreground">
            Clique no link enviado para seu email para verificar sua conta.
          </p>
        </div>

        <FieldDescription className="text-center">
          Não recebeu o email?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="underline underline-offset-4 hover:text-primary disabled:opacity-50"
          >
            {isResending ? "Reenviando..." : "Reenviar"}
          </button>
        </FieldDescription>

        <Button onClick={handleContinue} variant="outline" className="w-full">
          Voltar para o login
        </Button>
      </FieldGroup>
    </div>
  )
}
