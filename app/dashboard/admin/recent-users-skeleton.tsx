import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function RecentUsersSkeleton() {
  return (
    <Card>
      <CardHeader className="flex w-full flex-row items-center justify-between py-4">
        <div>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Últimos usuários registrados no sistema</CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}