"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { IconLoader2 } from "@tabler/icons-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { deleteOrganizationAction } from "@/app/actions/admin"

interface Organization {
  id: string
  name: string
  _count: {
    users: number
  }
}

interface DeleteOrganizationDialogProps {
  organization: Organization | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteOrganizationDialog({
  organization,
  open,
  onOpenChange,
}: DeleteOrganizationDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const handleDelete = async () => {
    if (!organization) return

    setLoading(true)

    try {
      const result = await deleteOrganizationAction(organization.id)

      if (result.success) {
        toast.success("Organização deletada com sucesso!")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error || "Erro ao deletar organização")
      }
    } catch (error) {
      toast.error("Erro ao deletar organização")
    } finally {
      setLoading(false)
    }
  }

  if (!organization) return null

  const hasUsers = organization._count.users > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasUsers ? (
              <>
                Esta organização possui <strong>{organization._count.users} usuário(s)</strong> associado(s).
                <br />
                <br />
                Não é possível deletar uma organização que possui usuários. Por favor, remova ou transfira todos os usuários primeiro.
              </>
            ) : (
              <>
                Esta ação não pode ser desfeita. Isso vai deletar permanentemente a organização{" "}
                <strong>{organization.name}</strong> e remover todos os dados associados.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          {!hasUsers && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deletar
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
