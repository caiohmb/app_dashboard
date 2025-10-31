"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  image: string | null
}

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    image: user.image || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Usa o método updateUser do Better Auth
      await authClient.updateUser({
        name: formData.name,
        image: formData.image || undefined,
      })

      toast.success("Perfil atualizado com sucesso!")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="name">Nome</FieldLabel>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <FieldDescription>
          Seu nome completo
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
        />
        <FieldDescription>
          O email não pode ser alterado
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="image">URL da Imagem de Perfil</FieldLabel>
        <Input
          id="image"
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://exemplo.com/foto.jpg"
        />
        <FieldDescription>
          URL da sua foto de perfil
        </FieldDescription>
      </Field>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </form>
  )
}
