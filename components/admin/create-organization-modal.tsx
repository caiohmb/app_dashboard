"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { IconLoader2 } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createOrganizationAction } from "@/app/actions/admin"

interface CreateOrganizationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOrganizationModal({
  open,
  onOpenChange,
}: CreateOrganizationModalProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createOrganizationAction({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        logo: formData.logo || undefined,
      })

      if (result.success) {
        toast.success("Organização criada com sucesso!")
        onOpenChange(false)
        setFormData({ name: "", slug: "", description: "", logo: "" })
        router.refresh()
      } else {
        toast.error(result.error || "Erro ao criar organização")
      }
    } catch (error) {
      toast.error("Erro ao criar organização")
    } finally {
      setLoading(false)
    }
  }

  // Auto-gerar slug a partir do nome
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais, exceto espaços e hifens
      .trim()
      .replace(/\s+/g, "-") // Substitui espaços por -
      .replace(/-+/g, "-") // Remove hifens duplicados
    setFormData({ ...formData, name, slug })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Nova Organização</DialogTitle>
            <DialogDescription>
              Adicione uma nova organização ao sistema
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Acme Corporation"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="acme-corporation"
                required
              />
              <p className="text-xs text-muted-foreground">
                Identificador único usado em URLs
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da organização..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo">Logo (URL)</Label>
              <Input
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Organização
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
