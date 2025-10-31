"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { IconCheck, IconAlertCircle, IconEye, IconEyeOff } from "@tabler/icons-react"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const token = searchParams.get("token")
  const tokenError = searchParams.get("error")

  useEffect(() => {
    if (tokenError === "INVALID_TOKEN") {
      setError("Link inválido ou expirado. Solicite um novo link de redefinição.")
    }
  }, [tokenError])

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return "A senha deve ter no mínimo 8 caracteres"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Token de redefinição não encontrado")
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: password,
        token,
      })

      if (error) {
        toast.error("Erro ao redefinir senha. O link pode estar expirado.")
        console.error(error)
      } else {
        setSuccess(true)
        toast.success("Senha redefinida com sucesso!")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro ao redefinir senha. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-card p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <IconAlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="mb-2 text-lg font-semibold">Link inválido</h2>
        <p className="mb-6 text-sm text-muted-foreground">{error}</p>
        <Link href="/forgot-password">
          <Button className="w-full">Solicitar novo link</Button>
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
          <IconCheck className="h-6 w-6 text-green-500" />
        </div>
        <h2 className="mb-2 text-lg font-semibold">Senha redefinida!</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Sua senha foi alterada com sucesso. Redirecionando para o login...
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field>
          <FieldLabel htmlFor="password">Nova senha</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </button>
          </div>
          <FieldDescription>Mínimo de 8 caracteres</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirmar senha</FieldLabel>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </button>
          </div>
          <FieldDescription>As senhas devem ser iguais</FieldDescription>
        </Field>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Redefinindo..." : "Redefinir senha"}
        </Button>

        <div className="text-center">
          <Link href="/login">
            <Button variant="ghost" className="text-sm">
              Voltar para login
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
