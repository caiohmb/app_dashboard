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
import { revokeSessionAction } from "@/app/actions/admin"

interface Session {
  id: string
  token: string
  user: {
    name: string
  }
}

interface RevokeSessionDialogProps {
  session: Session | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RevokeSessionDialog({
  session,
  open,
  onOpenChange,
}: RevokeSessionDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const handleRevoke = async () => {
    if (!session) return

    setLoading(true)

    try {
      const result = await revokeSessionAction(session.token)

      if (result.success) {
        toast.success("Sessão revogada com sucesso!")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error || "Erro ao revogar sessão")
      }
    } catch (error) {
      toast.error("Erro ao revogar sessão")
    } finally {
      setLoading(false)
    }
  }

  if (!session) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revogar Sessão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja revogar esta sessão? O usuário{" "}
            <strong>{session.user.name}</strong> será desconectado imediatamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRevoke}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Revogar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}