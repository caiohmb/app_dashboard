# Configuração do Sistema Admin

## Status da Implementação

### ✅ Concluído - Configuração Inicial (Rodada 1)

1. **Plugin Admin Instalado**
   - Servidor: [lib/auth.ts](lib/auth.ts#L13-L22)
   - Cliente: [lib/auth-client.ts](lib/auth-client.ts#L7-L12)

2. **Sistema de Permissões Customizado**
   - Arquivo: [lib/permissions.ts](lib/permissions.ts)
   - Roles: `user`, `admin`, `superadmin`
   - Recursos: `dashboard`, `metrics`, `reports`, `users`

3. **Hooks de Verificação**
   - Arquivo: [hooks/use-admin.ts](hooks/use-admin.ts)
   - `useIsAdmin()` - Verifica se é admin
   - `useHasPermission()` - Verifica permissão específica
   - `useAdminSession()` - Dados completos da sessão
   - `useHasRole()` - Verifica role específica

4. **Schema do Banco de Dados**
   - Migração aplicada com sucesso
   - Novas tabelas: permissões, roles, bans

### ✅ Concluído - Interface Admin Básica (Rodada 2)

5. **Middleware de Proteção**
   - Arquivo: [middleware.ts](middleware.ts)
   - Protege rotas `/dashboard/admin/*`
   - Redireciona não-autorizados para login
   - Redireciona não-admins para dashboard

6. **Layout Admin**
   - Arquivo: [app/dashboard/admin/layout.tsx](app/dashboard/admin/layout.tsx)
   - Usa AppSidebar e SiteHeader padrão
   - Dupla verificação de segurança server-side

7. **Dashboard Admin**
   - Arquivo: [app/dashboard/admin/page.tsx](app/dashboard/admin/page.tsx)
   - Métricas: Total de usuários, verificados, ativos, banidos
   - Lista de usuários recentes
   - Links rápidos para gerenciamento

8. **Sidebar Admin**
   - Link "Admin" visível apenas para admins
   - Usa hook `useIsAdmin()` para verificação client-side
   - Ícone IconShieldCheck

9. **Componentes UI**
   - [components/admin/role-badge.tsx](components/admin/role-badge.tsx) - Badge colorido por role

## Como Criar o Primeiro Admin

### Opção 1: Via Prisma Studio (Recomendado)

1. Abra o Prisma Studio:
```bash
npx prisma studio
```

2. Navegue até a tabela `user`
3. Encontre seu usuário
4. Edite o campo `role` e adicione: `admin`
5. Salve as alterações

### Opção 2: Via SQL Direto

```sql
UPDATE "User"
SET role = 'admin'
WHERE email = 'seu-email@exemplo.com';
```

### Opção 3: Via Script Node.js

Crie um arquivo `scripts/create-admin.ts`:

```typescript
import { prisma } from "@/lib/prisma"

async function createAdmin(email: string) {
  const user = await prisma.user.update({
    where: { email },
    data: { role: "admin" }
  })
  console.log("Admin criado:", user)
}

// Substitua pelo email do usuário
createAdmin("seu-email@exemplo.com")
  .then(() => process.exit(0))
  .catch(console.error)
```

Execute:
```bash
npx tsx scripts/create-admin.ts
```

## Verificação

Para verificar se o admin foi criado corretamente:

1. Faça login na aplicação
2. Abra o console do navegador
3. Execute:
```javascript
// No componente React com o hook
const { isAdmin, roles } = useAdminSession()
console.log({ isAdmin, roles })
```

## Próximos Passos

### Implementações Pendentes (em ordem de prioridade):

1. **Middleware de Proteção de Rotas**
   - Server middleware para `/dashboard/admin/*`
   - Client-side protection hook

2. **Interface Admin Básica**
   - Layout admin: [app/dashboard/admin/layout.tsx](app/dashboard/admin/layout.tsx)
   - Dashboard admin: [app/dashboard/admin/page.tsx](app/dashboard/admin/page.tsx)

3. **Gerenciamento de Usuários**
   - Listagem com paginação
   - Criar, editar, deletar
   - Atribuir roles

4. **Sistema de Ban**
   - Modal de ban com motivo e expiração
   - Listagem de usuários banidos

5. **Gerenciamento de Sessões**
   - Listar sessões ativas
   - Revogar sessões

6. **Sistema de Impersonação**
   - Banner de impersonação
   - Botão para parar impersonação

7. **Logs de Auditoria**
   - Schema para audit logs
   - Interface de visualização

## Estrutura de Permissões

### Role: user
- Dashboard: view
- Metrics: view
- Reports: view
- Users: (sem permissões)

### Role: admin
- Dashboard: view, edit
- Metrics: view, edit, export
- Reports: view, create, edit, delete
- Users: view, edit, delete
- Admin Plugin: todas as permissões padrão

### Role: superadmin
- Todas as permissões (futura expansão)

## Configuração Atual

```typescript
// lib/auth.ts
admin({
  defaultRole: "user",
  adminRoles: ["admin", "superadmin"],
  impersonationSessionDuration: 3600, // 1 hora
  defaultBanReason: "Violação dos termos de uso",
  defaultBanExpiresIn: 604800, // 7 dias
  bannedUserMessage: "Sua conta foi suspensa. Entre em contato com o suporte.",
})
```

## Troubleshooting

### Erro: "Prisma Client não gerado"
```bash
npx prisma generate
```

### Erro: "Schema desatualizado"
```bash
npx @better-auth/cli generate
npx prisma db push
```

### Verificar permissões no banco
```sql
SELECT * FROM "User" WHERE role LIKE '%admin%';
```
