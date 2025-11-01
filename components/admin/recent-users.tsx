import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RoleBadge } from "@/components/admin/role-badge"

export async function RecentUsers() {
  const latestUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      role: true,
    }
  })

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="recent-users">
        <Card>
          <AccordionTrigger className="flex w-full items-center justify-between p-4 py-4 text-left">
            <div>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription className="mt-1">Últimos usuários registrados no sistema</CardDescription>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="pt-0">
              {latestUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum usuário registrado ainda</p>
              ) : (
                <div className="space-y-4">
                  {latestUsers.map((user) => (
                    <Link href={`/dashboard/admin/users?search=${encodeURIComponent(user.email)}`} key={user.id}>
                      <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted">
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <RoleBadge role={user.role || "user"} />
                          <p className="text-xs text-muted-foreground mt-1">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  )
}