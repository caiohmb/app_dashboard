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
import { deleteUserAction } from "@/app/actions/admin"

interface User {
  id: string
  name: string
}

interface DeleteUserDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({ user, open, onOpenChange }: DeleteUserDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const handleDelete = async () => {
    if (!user) return

    setLoading(true)

    try {
      const result = await deleteUserAction(user.id)

      if (result.success) {
        toast.success("Usuário deletado com sucesso!")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error || "Erro ao deletar usuário")
      }
    } catch (error) {
      toast.error("Erro ao deletar usuário")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso vai deletar permanentemente a conta de{" "}
            <strong>{user.name}</strong> e remover todos os dados associados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deletar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
