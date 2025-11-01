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
import { banUserAction } from "@/app/actions/admin"

interface User {
  id: string
  name: string
}

interface BanUserModalProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BanUserModal({ user, open, onOpenChange }: BanUserModalProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    reason: "",
    expiresInDays: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      const result = await banUserAction({
        userId: user.id,
        reason: formData.reason,
        expiresInDays: formData.expiresInDays
          ? parseInt(formData.expiresInDays)
          : undefined,
      })

      if (result.success) {
        toast.success("Usuário banido com sucesso!")
        onOpenChange(false)
        setFormData({ reason: "", expiresInDays: "" })
        router.refresh()
      } else {
        toast.error(result.error || "Erro ao banir usuário")
      }
    } catch (error) {
      toast.error("Erro ao banir usuário")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Banir Usuário</DialogTitle>
          <DialogDescription>
            Banir {user.name} do sistema
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Motivo do Ban</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Violação dos termos de uso..."
                required
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expires">Expiração (dias)</Label>
              <Input
                id="expires"
                type="number"
                value={formData.expiresInDays}
                onChange={(e) =>
                  setFormData({ ...formData, expiresInDays: e.target.value })
                }
                placeholder="Deixe vazio para ban permanente"
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Deixe vazio para ban permanente
              </p>
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
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              Banir Usuário
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
