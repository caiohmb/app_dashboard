"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface UserMetrics {
  id: string
  totalRevenue: number
  revenueChange: number
  totalCustomers: number
  customersChange: number
  activeAccounts: number
  accountsChange: number
  growthRate: number
  growthChange: number
}

interface MetricsFormProps {
  metrics: UserMetrics | null
  userId: string
}

export function MetricsForm({ metrics, userId }: MetricsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    totalRevenue: metrics?.totalRevenue ?? 0,
    revenueChange: metrics?.revenueChange ?? 0,
    totalCustomers: metrics?.totalCustomers ?? 0,
    customersChange: metrics?.customersChange ?? 0,
    activeAccounts: metrics?.activeAccounts ?? 0,
    accountsChange: metrics?.accountsChange ?? 0,
    growthRate: metrics?.growthRate ?? 0,
    growthChange: metrics?.growthChange ?? 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar métricas")
      }

      toast.success("Métricas atualizadas com sucesso!")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar métricas")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNumberChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setFormData({ ...formData, [field]: numValue })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="totalRevenue">Receita Total (R$)</FieldLabel>
          <Input
            id="totalRevenue"
            type="number"
            step="0.01"
            value={formData.totalRevenue}
            onChange={(e) => handleNumberChange("totalRevenue", e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="revenueChange">Mudança de Receita (%)</FieldLabel>
          <Input
            id="revenueChange"
            type="number"
            step="0.1"
            value={formData.revenueChange}
            onChange={(e) => handleNumberChange("revenueChange", e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="totalCustomers">Total de Clientes</FieldLabel>
          <Input
            id="totalCustomers"
            type="number"
            value={formData.totalCustomers}
            onChange={(e) => handleNumberChange("totalCustomers", e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="customersChange">Mudança de Clientes (%)</FieldLabel>
          <Input
            id="customersChange"
            type="number"
            step="0.1"
            value={formData.customersChange}
            onChange={(e) => handleNumberChange("customersChange", e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="activeAccounts">Contas Ativas</FieldLabel>
          <Input
            id="activeAccounts"
            type="number"
            value={formData.activeAccounts}
            onChange={(e) => handleNumberChange("activeAccounts", e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="accountsChange">Mudança de Contas (%)</FieldLabel>
          <Input
            id="accountsChange"
            type="number"
            step="0.1"
            value={formData.accountsChange}
            onChange={(e) => handleNumberChange("accountsChange", e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="growthRate">Taxa de Crescimento (%)</FieldLabel>
          <Input
            id="growthRate"
            type="number"
            step="0.1"
            value={formData.growthRate}
            onChange={(e) => handleNumberChange("growthRate", e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="growthChange">Mudança de Crescimento (%)</FieldLabel>
          <Input
            id="growthChange"
            type="number"
            step="0.1"
            value={formData.growthChange}
            onChange={(e) => handleNumberChange("growthChange", e.target.value)}
          />
        </Field>
      </div>

      <FieldDescription>
        Configure as métricas que serão exibidas no seu dashboard
      </FieldDescription>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : "Atualizar Métricas"}
      </Button>
    </form>
  )
}
