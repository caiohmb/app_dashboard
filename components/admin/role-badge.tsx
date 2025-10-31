import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RoleBadgeProps {
  role: string
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    admin: {
      label: "Admin",
      variant: "destructive"
    },
    superadmin: {
      label: "Super Admin",
      variant: "destructive"
    },
    user: {
      label: "Usuário",
      variant: "secondary"
    }
  }

  const config = roleConfig[role.toLowerCase()] || {
    label: role,
    variant: "outline" as const
  }

  return (
    <Badge
      variant={config.variant}
      className={cn("text-xs", className)}
    >
      {config.label}
    </Badge>
  )
}
