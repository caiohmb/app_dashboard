"use client"

import { useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { IconArrowLeft, IconMail } from "@tabler/icons-react"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await authClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error("Erro ao enviar email. Tente novamente.")
        console.error(error)
      } else {
        setEmailSent(true)
        toast.success("Email enviado! Verifique sua caixa de entrada.")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro ao enviar email. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <IconMail className="h-6 w-6 text-primary" />
        </div>
        <h2 className="mb-2 text-lg font-semibold">Email enviado!</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Enviamos um link para redefinir sua senha para <strong>{email}</strong>.
          <br />
          Verifique sua caixa de entrada e spam.
        </p>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setEmailSent(false)}
          >
            Enviar novamente
          </Button>
          <Link href="/login">
            <Button variant="ghost" className="w-full">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Voltar para login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <FieldDescription>
            Digite o email cadastrado na sua conta
          </FieldDescription>
        </Field>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Enviar link de redefinição"}
        </Button>

        <div className="text-center">
          <Link href="/login">
            <Button variant="ghost" className="w-full">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Voltar para login
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
