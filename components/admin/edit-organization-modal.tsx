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
import { updateOrganizationAction } from "@/app/actions/admin"

interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
}

interface EditOrganizationModalProps {
  organization: Organization | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditOrganizationModal({
  organization,
  open,
  onOpenChange,
}: EditOrganizationModalProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
  })

  React.useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        slug: organization.slug,
        description: organization.description || "",
        logo: organization.logo || "",
      })
    }
  }, [organization])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) return

    setLoading(true)

    try {
      const result = await updateOrganizationAction({
        organizationId: organization.id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        logo: formData.logo || undefined,
      })

      if (result.success) {
        toast.success("Organização atualizada com sucesso!")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error || "Erro ao atualizar organização")
      }
    } catch (error) {
      toast.error("Erro ao atualizar organização")
    } finally {
      setLoading(false)
    }
  }

  if (!organization) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Organização</DialogTitle>
            <DialogDescription>
              Atualize as informações da organização
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Acme Corporation"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-slug">Slug *</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="acme-corporation"
                required
              />
              <p className="text-xs text-muted-foreground">
                Identificador único usado em URLs
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da organização..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-logo">Logo (URL)</Label>
              <Input
                id="edit-logo"
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
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
