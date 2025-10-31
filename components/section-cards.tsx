import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface UserMetrics {
  totalRevenue: number
  revenueChange: number
  totalCustomers: number
  customersChange: number
  activeAccounts: number
  accountsChange: number
  growthRate: number
  growthChange: number
}

interface SectionCardsProps {
  metrics: UserMetrics
}

export function SectionCards({ metrics }: SectionCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Receita Total</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(metrics.totalRevenue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {metrics.revenueChange >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {formatPercentage(metrics.revenueChange)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metrics.revenueChange >= 0 ? 'Crescimento este mês' : 'Queda este mês'}
            {metrics.revenueChange >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Receita dos últimos 6 meses
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Novos Clientes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(metrics.totalCustomers)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {metrics.customersChange >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {formatPercentage(metrics.customersChange)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metrics.customersChange >= 0 ? 'Crescimento neste período' : 'Queda neste período'}
            {metrics.customersChange >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            {metrics.customersChange >= 0 ? 'Boa aquisição de clientes' : 'Aquisição precisa de atenção'}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Contas Ativas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(metrics.activeAccounts)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {metrics.accountsChange >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {formatPercentage(metrics.accountsChange)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metrics.accountsChange >= 0 ? 'Forte retenção de usuários' : 'Retenção precisa melhorar'}
            {metrics.accountsChange >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            {metrics.accountsChange >= 0 ? 'Engajamento excede metas' : 'Engajamento abaixo da meta'}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Taxa de Crescimento</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatPercentage(metrics.growthRate)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {metrics.growthChange >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {formatPercentage(metrics.growthChange)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metrics.growthChange >= 0 ? 'Aumento de performance' : 'Queda de performance'}
            {metrics.growthChange >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            {metrics.growthChange >= 0 ? 'Atinge projeções de crescimento' : 'Abaixo das projeções'}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
